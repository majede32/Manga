// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title MADUToken
 * @dev العقد الذكي الرئيسي للدينار المغاربي الرقمي (MADU)
 * 
 * هذا العقد يوفر:
 * - وظائف العملة الرقمية الأساسية (ERC20)
 * - التحكم في الوصول للبنوك المركزية
 * - إمكانية الإيقاف المؤقت في حالات الطوارئ
 * - آليات مكافحة غسيل الأموال (AML)
 * - دعم KYC للمستخدمين
 * - التحكم في السياسة النقدية
 */
contract MADUToken is
    Initializable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    ERC20PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    // الأدوار والصلاحيات
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant CENTRAL_BANK_ROLE = keccak256("CENTRAL_BANK_ROLE");

    // أنواع البلدان المدعومة
    enum Country { TUNISIA, LIBYA, ALGERIA }

    // مستويات KYC
    enum KYCLevel { NONE, BASIC, ENHANCED, PREMIUM }

    // بيانات المستخدم للامتثال
    struct UserCompliance {
        KYCLevel kycLevel;
        Country country;
        bool isBlacklisted;
        uint256 dailyLimit;
        uint256 monthlyLimit;
        uint256 dailySpent;
        uint256 monthlySpent;
        uint256 lastResetDay;
        uint256 lastResetMonth;
    }

    // بيانات المعاملة للمراقبة
    struct TransactionRecord {
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
        string purpose;
        bool flagged;
    }

    // خرائط البيانات
    mapping(address => UserCompliance) public userCompliance;
    mapping(address => bool) public authorizedBanks;
    mapping(bytes32 => TransactionRecord) public transactions;
    
    // إحصائيات النظام
    uint256 public totalSupplyCap;
    uint256 public inflationRate;
    uint256 public lastInflationUpdate;
    uint256 public amlThreshold;
    
    // إحصائيات لكل بلد
    mapping(Country => uint256) public countrySupply;
    mapping(Country => uint256) public countryReserves;

    // الأحداث
    event UserKYCUpdated(address indexed user, KYCLevel newLevel, Country country);
    event UserBlacklisted(address indexed user, bool blacklisted);
    event TransactionFlagged(bytes32 indexed txHash, address from, address to, uint256 amount);
    event InflationAdjusted(uint256 newRate, uint256 timestamp);
    event BankAuthorized(address indexed bank, bool authorized);
    event ComplianceViolation(address indexed user, string reason);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev تهيئة العقد الذكي
     */
    function initialize(
        string memory name,
        string memory symbol,
        uint256 _totalSupplyCap,
        address _admin
    ) initializer public {
        __ERC20_init(name, symbol);
        __ERC20Burnable_init();
        __ERC20Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(MINTER_ROLE, _admin);
        _grantRole(PAUSER_ROLE, _admin);
        _grantRole(UPGRADER_ROLE, _admin);
        _grantRole(COMPLIANCE_ROLE, _admin);
        _grantRole(CENTRAL_BANK_ROLE, _admin);

        totalSupplyCap = _totalSupplyCap;
        inflationRate = 200; // 2% سنوياً (200 basis points)
        lastInflationUpdate = block.timestamp;
        amlThreshold = 10000 * 10**decimals(); // 10,000 MADU
    }

    /**
     * @dev إصدار عملة جديدة (البنوك المركزية فقط)
     */
    function mint(address to, uint256 amount, Country country) public onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= totalSupplyCap, "MADU: exceeds supply cap");
        require(_isValidUser(to), "MADU: invalid recipient");
        
        _mint(to, amount);
        countrySupply[country] += amount;
        
        _recordTransaction(to, address(0), amount, "MINT");
    }

    /**
     * @dev حرق العملة (البنوك المركزية فقط)
     */
    function burnFrom(address account, uint256 amount) public override onlyRole(MINTER_ROLE) {
        require(_isValidUser(account), "MADU: invalid account");
        
        Country userCountry = userCompliance[account].country;
        countrySupply[userCountry] -= amount;
        
        super.burnFrom(account, amount);
        _recordTransaction(address(0), account, amount, "BURN");
    }

    /**
     * @dev تحديث بيانات KYC للمستخدم
     */
    function updateUserKYC(
        address user,
        KYCLevel level,
        Country country,
        uint256 dailyLimit,
        uint256 monthlyLimit
    ) public onlyRole(COMPLIANCE_ROLE) {
        require(user != address(0), "MADU: invalid address");
        
        userCompliance[user] = UserCompliance({
            kycLevel: level,
            country: country,
            isBlacklisted: false,
            dailyLimit: dailyLimit,
            monthlyLimit: monthlyLimit,
            dailySpent: 0,
            monthlySpent: 0,
            lastResetDay: block.timestamp / 1 days,
            lastResetMonth: block.timestamp / 30 days
        });

        emit UserKYCUpdated(user, level, country);
    }

    /**
     * @dev إضافة/إزالة مستخدم من القائمة السوداء
     */
    function setBlacklist(address user, bool blacklisted) public onlyRole(COMPLIANCE_ROLE) {
        userCompliance[user].isBlacklisted = blacklisted;
        emit UserBlacklisted(user, blacklisted);
    }

    /**
     * @dev ترخيص/إلغاء ترخيص البنوك
     */
    function authorizeBanks(address bank, bool authorized) public onlyRole(CENTRAL_BANK_ROLE) {
        authorizedBanks[bank] = authorized;
        emit BankAuthorized(bank, authorized);
    }

    /**
     * @dev تحديث معدل التضخم
     */
    function updateInflationRate(uint256 newRate) public onlyRole(CENTRAL_BANK_ROLE) {
        require(newRate <= 1000, "MADU: inflation rate too high"); // أقصى 10%
        inflationRate = newRate;
        lastInflationUpdate = block.timestamp;
        emit InflationAdjusted(newRate, block.timestamp);
    }

    /**
     * @dev تحديث حد مراقبة AML
     */
    function updateAMLThreshold(uint256 newThreshold) public onlyRole(COMPLIANCE_ROLE) {
        amlThreshold = newThreshold;
    }

    /**
     * @dev إيقاف العقد مؤقتاً
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev إلغاء الإيقاف المؤقت
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev التحويل مع فحوصات الامتثال
     */
    function transfer(address to, uint256 amount) public override returns (bool) {
        address from = _msgSender();
        require(_canTransfer(from, to, amount), "MADU: transfer not allowed");
        
        _updateSpendingLimits(from, amount);
        _recordTransaction(from, to, amount, "TRANSFER");
        
        if (amount >= amlThreshold) {
            bytes32 txHash = keccak256(abi.encodePacked(from, to, amount, block.timestamp));
            transactions[txHash].flagged = true;
            emit TransactionFlagged(txHash, from, to, amount);
        }
        
        return super.transfer(to, amount);
    }

    /**
     * @dev التحويل بالوكالة مع فحوصات الامتثال
     */
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        require(_canTransfer(from, to, amount), "MADU: transfer not allowed");
        
        _updateSpendingLimits(from, amount);
        _recordTransaction(from, to, amount, "TRANSFER_FROM");
        
        if (amount >= amlThreshold) {
            bytes32 txHash = keccak256(abi.encodePacked(from, to, amount, block.timestamp));
            transactions[txHash].flagged = true;
            emit TransactionFlagged(txHash, from, to, amount);
        }
        
        return super.transferFrom(from, to, amount);
    }

    /**
     * @dev فحص إمكانية التحويل
     */
    function _canTransfer(address from, address to, uint256 amount) internal view returns (bool) {
        // فحص القائمة السوداء
        if (userCompliance[from].isBlacklisted || userCompliance[to].isBlacklisted) {
            return false;
        }
        
        // فحص KYC للمبالغ الكبيرة
        if (amount >= amlThreshold && userCompliance[from].kycLevel == KYCLevel.NONE) {
            return false;
        }
        
        // فحص الحدود اليومية والشهرية
        UserCompliance memory compliance = userCompliance[from];
        uint256 currentDay = block.timestamp / 1 days;
        uint256 currentMonth = block.timestamp / 30 days;
        
        uint256 dailySpent = compliance.lastResetDay == currentDay ? compliance.dailySpent : 0;
        uint256 monthlySpent = compliance.lastResetMonth == currentMonth ? compliance.monthlySpent : 0;
        
        if (dailySpent + amount > compliance.dailyLimit || 
            monthlySpent + amount > compliance.monthlyLimit) {
            return false;
        }
        
        return true;
    }

    /**
     * @dev تحديث حدود الإنفاق
     */
    function _updateSpendingLimits(address user, uint256 amount) internal {
        UserCompliance storage compliance = userCompliance[user];
        uint256 currentDay = block.timestamp / 1 days;
        uint256 currentMonth = block.timestamp / 30 days;
        
        // إعادة تعيين الحدود اليومية
        if (compliance.lastResetDay != currentDay) {
            compliance.dailySpent = 0;
            compliance.lastResetDay = currentDay;
        }
        
        // إعادة تعيين الحدود الشهرية
        if (compliance.lastResetMonth != currentMonth) {
            compliance.monthlySpent = 0;
            compliance.lastResetMonth = currentMonth;
        }
        
        compliance.dailySpent += amount;
        compliance.monthlySpent += amount;
    }

    /**
     * @dev تسجيل المعاملة للمراقبة
     */
    function _recordTransaction(address from, address to, uint256 amount, string memory purpose) internal {
        bytes32 txHash = keccak256(abi.encodePacked(from, to, amount, block.timestamp, purpose));
        transactions[txHash] = TransactionRecord({
            from: from,
            to: to,
            amount: amount,
            timestamp: block.timestamp,
            purpose: purpose,
            flagged: false
        });
    }

    /**
     * @dev فحص صحة المستخدم
     */
    function _isValidUser(address user) internal view returns (bool) {
        return user != address(0) && !userCompliance[user].isBlacklisted;
    }

    /**
     * @dev الحصول على إحصائيات البلد
     */
    function getCountryStats(Country country) public view returns (uint256 supply, uint256 reserves) {
        return (countrySupply[country], countryReserves[country]);
    }

    /**
     * @dev الحصول على بيانات امتثال المستخدم
     */
    function getUserCompliance(address user) public view returns (UserCompliance memory) {
        return userCompliance[user];
    }

    /**
     * @dev فحص أمان الترقية
     */
    function _authorizeUpgrade(address newImplementation) internal onlyRole(UPGRADER_ROLE) override {}

    /**
     * @dev دمج وظائف الإيقاف المؤقت
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override(ERC20Upgradeable, ERC20PausableUpgradeable)
    {
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * @dev دالة احتياطية لمنع الإرسال العشوائي
     */
    receive() external payable {
        revert("MADU: direct payments not accepted");
    }
}