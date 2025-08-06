// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "./MADUToken.sol";

/**
 * @title MADUStaking
 * @dev عقد ذكي لنظام الرهان والمكافآت للدينار المغاربي الرقمي
 * 
 * يوفر هذا العقد:
 * - نظام رهان العملة للحصول على مكافآت
 * - مستويات رهان مختلفة حسب المدة
 * - توزيع المكافآت التلقائي
 * - نظام التفويض للمصدقين
 * - حماية من مخاطر السلاشينغ
 */
contract MADUStaking is
    Initializable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant SLASHER_ROLE = keccak256("SLASHER_ROLE");

    IERC20 public maduToken;

    // فترات الرهان المختلفة
    enum StakingPeriod { FLEXIBLE, MONTH_3, MONTH_6, MONTH_12, MONTH_24 }

    // بيانات الرهان
    struct StakingInfo {
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
        StakingPeriod period;
        uint256 rewardRate;
        uint256 accumulatedRewards;
        uint256 lastRewardTime;
        bool isActive;
        address validator; // المصدق المفوض له
    }

    // بيانات المصدق
    struct ValidatorInfo {
        address validatorAddress;
        uint256 totalStaked;
        uint256 delegatedStaked;
        uint256 commission; // نسبة العمولة (basis points)
        uint256 slashCount;
        bool isActive;
        bool isJailed;
        uint256 jailEndTime;
        MADUToken.Country country;
    }

    // معدلات المكافآت لكل فترة (basis points)
    mapping(StakingPeriod => uint256) public rewardRates;
    
    // معلومات الرهان لكل مستخدم
    mapping(address => StakingInfo[]) public userStakes;
    
    // معلومات المصدقين
    mapping(address => ValidatorInfo) public validators;
    address[] public validatorsList;
    
    // إحصائيات إجمالية
    uint256 public totalStaked;
    uint256 public totalRewardsPaid;
    uint256 public minStakeAmount;
    uint256 public maxStakeAmount;
    uint256 public validatorMinStake;
    uint256 public slashingRate; // نسبة المعاقبة (basis points)
    uint256 public unstakingPeriod; // فترة إلغاء الرهان بالثواني
    
    // صندوق المكافآت
    uint256 public rewardPool;
    uint256 public lastPoolUpdate;

    // إحصائيات لكل بلد
    mapping(MADUToken.Country => uint256) public countryStaked;
    mapping(MADUToken.Country => uint256) public countryValidators;

    // طلبات إلغاء الرهان
    struct UnstakeRequest {
        uint256 amount;
        uint256 requestTime;
        uint256 availableTime;
        bool processed;
    }
    
    mapping(address => UnstakeRequest[]) public unstakeRequests;

    // الأحداث
    event Staked(address indexed user, uint256 amount, StakingPeriod period, address validator);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event UnstakeRequested(address indexed user, uint256 amount, uint256 availableTime);
    event RewardClaimed(address indexed user, uint256 amount);
    event ValidatorRegistered(address indexed validator, MADUToken.Country country);
    event ValidatorSlashed(address indexed validator, uint256 amount, string reason);
    event ValidatorJailed(address indexed validator, uint256 jailTime);
    event DelegationChanged(address indexed user, address indexed oldValidator, address indexed newValidator);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev تهيئة عقد الرهان
     */
    function initialize(
        address _maduToken,
        address _admin
    ) initializer public {
        __ReentrancyGuard_init();
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        maduToken = IERC20(_maduToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(SLASHER_ROLE, _admin);

        // تعيين معدلات المكافآت الأولية
        rewardRates[StakingPeriod.FLEXIBLE] = 300; // 3% سنوياً
        rewardRates[StakingPeriod.MONTH_3] = 500;   // 5% سنوياً
        rewardRates[StakingPeriod.MONTH_6] = 700;   // 7% سنوياً
        rewardRates[StakingPeriod.MONTH_12] = 1000; // 10% سنوياً
        rewardRates[StakingPeriod.MONTH_24] = 1500; // 15% سنوياً

        minStakeAmount = 100 * 10**18; // 100 MADU
        maxStakeAmount = 1000000 * 10**18; // مليون MADU
        validatorMinStake = 100000 * 10**18; // 100 ألف MADU
        slashingRate = 500; // 5%
        unstakingPeriod = 7 days;
        lastPoolUpdate = block.timestamp;
    }

    /**
     * @dev رهان العملة
     */
    function stake(
        uint256 amount,
        StakingPeriod period,
        address validator
    ) external nonReentrant whenNotPaused {
        require(amount >= minStakeAmount, "Amount below minimum");
        require(amount <= maxStakeAmount, "Amount above maximum");
        require(validators[validator].isActive, "Invalid validator");
        require(!validators[validator].isJailed, "Validator is jailed");

        // نقل العملة من المستخدم
        require(maduToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        // حساب وقت الانتهاء
        uint256 stakingDuration = _getStakingDuration(period);
        uint256 endTime = period == StakingPeriod.FLEXIBLE ? 0 : block.timestamp + stakingDuration;

        // إنشاء معلومات الرهان
        StakingInfo memory newStake = StakingInfo({
            amount: amount,
            startTime: block.timestamp,
            endTime: endTime,
            period: period,
            rewardRate: rewardRates[period],
            accumulatedRewards: 0,
            lastRewardTime: block.timestamp,
            isActive: true,
            validator: validator
        });

        userStakes[msg.sender].push(newStake);

        // تحديث الإحصائيات
        totalStaked += amount;
        validators[validator].delegatedStaked += amount;

        MADUToken.Country validatorCountry = validators[validator].country;
        countryStaked[validatorCountry] += amount;

        emit Staked(msg.sender, amount, period, validator);
    }

    /**
     * @dev إلغاء الرهان
     */
    function unstake(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        
        StakingInfo storage stakeInfo = userStakes[msg.sender][stakeIndex];
        require(stakeInfo.isActive, "Stake not active");

        // فحص فترة الرهان
        if (stakeInfo.period != StakingPeriod.FLEXIBLE) {
            require(block.timestamp >= stakeInfo.endTime, "Staking period not completed");
        }

        // حساب المكافآت
        uint256 rewards = _calculateRewards(msg.sender, stakeIndex);
        
        // تحديث المعلومات
        stakeInfo.isActive = false;
        stakeInfo.accumulatedRewards += rewards;

        // تحديث الإحصائيات
        totalStaked -= stakeInfo.amount;
        validators[stakeInfo.validator].delegatedStaked -= stakeInfo.amount;
        
        MADUToken.Country validatorCountry = validators[stakeInfo.validator].country;
        countryStaked[validatorCountry] -= stakeInfo.amount;

        // إنشاء طلب إلغاء رهان للمرن
        if (stakeInfo.period == StakingPeriod.FLEXIBLE) {
            UnstakeRequest memory request = UnstakeRequest({
                amount: stakeInfo.amount,
                requestTime: block.timestamp,
                availableTime: block.timestamp + unstakingPeriod,
                processed: false
            });
            
            unstakeRequests[msg.sender].push(request);
            emit UnstakeRequested(msg.sender, stakeInfo.amount, request.availableTime);
        } else {
            // إرسال العملة والمكافآت فوراً للفترات الثابتة
            _sendStakeAndRewards(msg.sender, stakeInfo.amount, rewards);
            emit Unstaked(msg.sender, stakeInfo.amount, rewards);
        }
    }

    /**
     * @dev سحب العملة بعد انتهاء فترة الانتظار
     */
    function withdrawUnstaked(uint256 requestIndex) external nonReentrant {
        require(requestIndex < unstakeRequests[msg.sender].length, "Invalid request index");
        
        UnstakeRequest storage request = unstakeRequests[msg.sender][requestIndex];
        require(!request.processed, "Already processed");
        require(block.timestamp >= request.availableTime, "Waiting period not completed");

        request.processed = true;

        // إرسال العملة
        require(maduToken.transfer(msg.sender, request.amount), "Transfer failed");
        
        emit Unstaked(msg.sender, request.amount, 0);
    }

    /**
     * @dev سحب المكافآت
     */
    function claimRewards(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        
        StakingInfo storage stakeInfo = userStakes[msg.sender][stakeIndex];
        require(stakeInfo.isActive, "Stake not active");

        uint256 rewards = _calculateRewards(msg.sender, stakeIndex);
        require(rewards > 0, "No rewards to claim");

        stakeInfo.accumulatedRewards += rewards;
        stakeInfo.lastRewardTime = block.timestamp;
        totalRewardsPaid += rewards;

        // إصدار مكافآت جديدة
        MADUToken(address(maduToken)).mint(msg.sender, rewards, validators[stakeInfo.validator].country);
        
        emit RewardClaimed(msg.sender, rewards);
    }

    /**
     * @dev تسجيل مصدق جديد
     */
    function registerValidator(
        address validatorAddress,
        uint256 commission,
        MADUToken.Country country
    ) external onlyRole(ADMIN_ROLE) {
        require(validatorAddress != address(0), "Invalid validator address");
        require(commission <= 10000, "Commission too high"); // أقصى 100%
        require(!validators[validatorAddress].isActive, "Validator already registered");

        validators[validatorAddress] = ValidatorInfo({
            validatorAddress: validatorAddress,
            totalStaked: 0,
            delegatedStaked: 0,
            commission: commission,
            slashCount: 0,
            isActive: true,
            isJailed: false,
            jailEndTime: 0,
            country: country
        });

        validatorsList.push(validatorAddress);
        countryValidators[country]++;
        
        _grantRole(VALIDATOR_ROLE, validatorAddress);
        emit ValidatorRegistered(validatorAddress, country);
    }

    /**
     * @dev معاقبة مصدق (Slashing)
     */
    function slashValidator(
        address validatorAddress,
        string calldata reason
    ) external onlyRole(SLASHER_ROLE) {
        require(validators[validatorAddress].isActive, "Validator not active");

        ValidatorInfo storage validator = validators[validatorAddress];
        
        // حساب المبلغ المعاقب
        uint256 slashAmount = (validator.delegatedStaked * slashingRate) / 10000;
        
        // تطبيق المعاقبة
        validator.slashCount++;
        validator.delegatedStaked -= slashAmount;
        totalStaked -= slashAmount;

        // سجن المصدق إذا تكررت المخالفات
        if (validator.slashCount >= 3) {
            validator.isJailed = true;
            validator.jailEndTime = block.timestamp + 30 days;
            emit ValidatorJailed(validatorAddress, validator.jailEndTime);
        }

        emit ValidatorSlashed(validatorAddress, slashAmount, reason);
    }

    /**
     * @dev الإفراج عن مصدق مسجون
     */
    function unjailValidator(address validatorAddress) external onlyRole(ADMIN_ROLE) {
        require(validators[validatorAddress].isJailed, "Validator not jailed");
        require(block.timestamp >= validators[validatorAddress].jailEndTime, "Jail period not completed");

        validators[validatorAddress].isJailed = false;
        validators[validatorAddress].jailEndTime = 0;
    }

    /**
     * @dev تغيير التفويض لمصدق آخر
     */
    function redelegate(
        uint256 stakeIndex,
        address newValidator
    ) external nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        require(validators[newValidator].isActive, "Invalid new validator");
        require(!validators[newValidator].isJailed, "New validator is jailed");

        StakingInfo storage stakeInfo = userStakes[msg.sender][stakeIndex];
        require(stakeInfo.isActive, "Stake not active");

        address oldValidator = stakeInfo.validator;
        require(oldValidator != newValidator, "Same validator");

        // تحديث إحصائيات المصدقين
        validators[oldValidator].delegatedStaked -= stakeInfo.amount;
        validators[newValidator].delegatedStaked += stakeInfo.amount;

        // تحديث إحصائيات البلدان
        countryStaked[validators[oldValidator].country] -= stakeInfo.amount;
        countryStaked[validators[newValidator].country] += stakeInfo.amount;

        stakeInfo.validator = newValidator;

        emit DelegationChanged(msg.sender, oldValidator, newValidator);
    }

    /**
     * @dev حساب المكافآت المتراكمة
     */
    function _calculateRewards(address user, uint256 stakeIndex) internal view returns (uint256) {
        StakingInfo storage stakeInfo = userStakes[user][stakeIndex];
        
        if (!stakeInfo.isActive) {
            return 0;
        }

        uint256 stakingTime = block.timestamp - stakeInfo.lastRewardTime;
        uint256 annualReward = (stakeInfo.amount * stakeInfo.rewardRate) / 10000;
        uint256 reward = (annualReward * stakingTime) / 365 days;

        // خصم عمولة المصدق
        uint256 validatorCommission = (reward * validators[stakeInfo.validator].commission) / 10000;
        
        return reward - validatorCommission;
    }

    /**
     * @dev الحصول على مدة الرهان بالثواني
     */
    function _getStakingDuration(StakingPeriod period) internal pure returns (uint256) {
        if (period == StakingPeriod.MONTH_3) return 90 days;
        if (period == StakingPeriod.MONTH_6) return 180 days;
        if (period == StakingPeriod.MONTH_12) return 365 days;
        if (period == StakingPeriod.MONTH_24) return 730 days;
        return 0; // للمرن
    }

    /**
     * @dev إرسال العملة والمكافآت
     */
    function _sendStakeAndRewards(address user, uint256 stakeAmount, uint256 rewards) internal {
        // إرسال العملة المرهونة
        require(maduToken.transfer(user, stakeAmount), "Stake transfer failed");
        
        // إصدار المكافآت
        if (rewards > 0) {
            MADUToken(address(maduToken)).mint(user, rewards, MADUToken.Country.TUNISIA); // default country
            totalRewardsPaid += rewards;
        }
    }

    /**
     * @dev تحديث معدلات المكافآت
     */
    function updateRewardRates(
        StakingPeriod period,
        uint256 newRate
    ) external onlyRole(ADMIN_ROLE) {
        require(newRate <= 2000, "Rate too high"); // أقصى 20%
        rewardRates[period] = newRate;
    }

    /**
     * @dev تحديث الحدود
     */
    function updateStakingLimits(
        uint256 _minStakeAmount,
        uint256 _maxStakeAmount,
        uint256 _validatorMinStake
    ) external onlyRole(ADMIN_ROLE) {
        minStakeAmount = _minStakeAmount;
        maxStakeAmount = _maxStakeAmount;
        validatorMinStake = _validatorMinStake;
    }

    /**
     * @dev الحصول على معلومات رهان المستخدم
     */
    function getUserStakes(address user) external view returns (StakingInfo[] memory) {
        return userStakes[user];
    }

    /**
     * @dev الحصول على قائمة المصدقين النشطين
     */
    function getActiveValidators() external view returns (address[] memory) {
        uint256 activeCount = 0;
        
        // عد المصدقين النشطين
        for (uint256 i = 0; i < validatorsList.length; i++) {
            if (validators[validatorsList[i]].isActive && !validators[validatorsList[i]].isJailed) {
                activeCount++;
            }
        }

        address[] memory activeValidators = new address[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < validatorsList.length; i++) {
            if (validators[validatorsList[i]].isActive && !validators[validatorsList[i]].isJailed) {
                activeValidators[index] = validatorsList[i];
                index++;
            }
        }

        return activeValidators;
    }

    /**
     * @dev الحصول على إحصائيات النظام
     */
    function getSystemStats() external view returns (
        uint256 _totalStaked,
        uint256 _totalRewardsPaid,
        uint256 _totalValidators,
        uint256 _activeValidators
    ) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < validatorsList.length; i++) {
            if (validators[validatorsList[i]].isActive && !validators[validatorsList[i]].isJailed) {
                activeCount++;
            }
        }

        return (totalStaked, totalRewardsPaid, validatorsList.length, activeCount);
    }

    /**
     * @dev فحص أمان الترقية
     */
    function _authorizeUpgrade(address newImplementation) internal onlyRole(ADMIN_ROLE) override {}

    /**
     * @dev إيقاف/استئناف العقد
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}