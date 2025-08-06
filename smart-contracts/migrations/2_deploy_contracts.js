/**
 * MADU Smart Contracts Deployment Script
 * سكريبت نشر العقود الذكية للدينار المغاربي الرقمي
 */

const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const MADUToken = artifacts.require("MADUToken");
const MADUStaking = artifacts.require("MADUStaking");

module.exports = async function (deployer, network, accounts) {
  console.log(`🚀 Deploying MADU contracts to network: ${network}`);
  
  // الحسابات المهمة
  const admin = accounts[0];
  const centralBankTunisia = accounts[1];
  const centralBankLibya = accounts[2]; 
  const centralBankAlgeria = accounts[3];
  
  console.log(`👤 Admin: ${admin}`);
  console.log(`🏦 Central Bank Tunisia: ${centralBankTunisia}`);
  console.log(`🏦 Central Bank Libya: ${centralBankLibya}`);
  console.log(`🏦 Central Bank Algeria: ${centralBankAlgeria}`);

  try {
    // 1. نشر عقد MADU Token
    console.log("\n📄 Deploying MADU Token...");
    
    const totalSupplyCap = web3.utils.toWei('21000000000', 'ether'); // 21 مليار MADU
    
    const maduToken = await deployProxy(
      MADUToken,
      [
        "Maghreb Arab Digital Unity", // اسم العملة
        "MADU",                       // رمز العملة
        totalSupplyCap,               // الحد الأقصى للإصدار
        admin                         // المدير
      ],
      { 
        deployer,
        kind: 'uups',
        initializer: 'initialize'
      }
    );

    console.log(`✅ MADU Token deployed at: ${maduToken.address}`);

    // 2. إعداد الأدوار للبنوك المركزية
    console.log("\n🔐 Setting up roles for central banks...");
    
    const MINTER_ROLE = await maduToken.MINTER_ROLE();
    const CENTRAL_BANK_ROLE = await maduToken.CENTRAL_BANK_ROLE();
    const COMPLIANCE_ROLE = await maduToken.COMPLIANCE_ROLE();

    // منح الأدوار للبنوك المركزية
    await maduToken.grantRole(CENTRAL_BANK_ROLE, centralBankTunisia);
    await maduToken.grantRole(CENTRAL_BANK_ROLE, centralBankLibya);
    await maduToken.grantRole(CENTRAL_BANK_ROLE, centralBankAlgeria);
    
    await maduToken.grantRole(MINTER_ROLE, centralBankTunisia);
    await maduToken.grantRole(MINTER_ROLE, centralBankLibya);
    await maduToken.grantRole(MINTER_ROLE, centralBankAlgeria);
    
    await maduToken.grantRole(COMPLIANCE_ROLE, admin);

    console.log("✅ Roles assigned successfully");

    // 3. إصدار العملة الأولية للبنوك المركزية
    console.log("\n💰 Minting initial supply...");
    
    const initialMintAmount = web3.utils.toWei('1000000000', 'ether'); // مليار لكل بنك مركزي
    
    // تونس (Country.TUNISIA = 0)
    await maduToken.mint(centralBankTunisia, initialMintAmount, 0);
    console.log(`✅ Minted ${web3.utils.fromWei(initialMintAmount, 'ether')} MADU for Tunisia`);
    
    // ليبيا (Country.LIBYA = 1)
    await maduToken.mint(centralBankLibya, initialMintAmount, 1);
    console.log(`✅ Minted ${web3.utils.fromWei(initialMintAmount, 'ether')} MADU for Libya`);
    
    // الجزائر (Country.ALGERIA = 2)
    await maduToken.mint(centralBankAlgeria, initialMintAmount, 2);
    console.log(`✅ Minted ${web3.utils.fromWei(initialMintAmount, 'ether')} MADU for Algeria`);

    // 4. نشر عقد Staking
    console.log("\n🥩 Deploying MADU Staking...");
    
    const maduStaking = await deployProxy(
      MADUStaking,
      [
        maduToken.address, // عنوان عقد MADU Token
        admin              // المدير
      ],
      { 
        deployer,
        kind: 'uups',
        initializer: 'initialize'
      }
    );

    console.log(`✅ MADU Staking deployed at: ${maduStaking.address}`);

    // 5. منح عقد Staking صلاحية إصدار العملة للمكافآت
    console.log("\n🔄 Granting minting role to staking contract...");
    await maduToken.grantRole(MINTER_ROLE, maduStaking.address);
    console.log("✅ Staking contract can now mint rewards");

    // 6. تسجيل المصدقين الأوليين
    console.log("\n👥 Registering initial validators...");
    
    // مصدق تونسي
    await maduStaking.registerValidator(
      centralBankTunisia,
      500, // 5% عمولة
      0    // Country.TUNISIA
    );
    
    // مصدق ليبي
    await maduStaking.registerValidator(
      centralBankLibya,
      500, // 5% عمولة
      1    // Country.LIBYA
    );
    
    // مصدق جزائري
    await maduStaking.registerValidator(
      centralBankAlgeria,
      500, // 5% عمولة
      2    // Country.ALGERIA
    );

    console.log("✅ Initial validators registered");

    // 7. إعداد بيانات KYC للحسابات الأولية
    console.log("\n📋 Setting up KYC for initial accounts...");
    
    // البنك المركزي التونسي
    await maduToken.updateUserKYC(
      centralBankTunisia,
      3, // KYCLevel.PREMIUM
      0, // Country.TUNISIA
      web3.utils.toWei('10000000', 'ether'), // حد يومي: 10 مليون
      web3.utils.toWei('100000000', 'ether') // حد شهري: 100 مليون
    );
    
    // البنك المركزي الليبي
    await maduToken.updateUserKYC(
      centralBankLibya,
      3, // KYCLevel.PREMIUM
      1, // Country.LIBYA
      web3.utils.toWei('10000000', 'ether'),
      web3.utils.toWei('100000000', 'ether')
    );
    
    // بنك الجزائر
    await maduToken.updateUserKYC(
      centralBankAlgeria,
      3, // KYCLevel.PREMIUM
      2, // Country.ALGERIA
      web3.utils.toWei('10000000', 'ether'),
      web3.utils.toWei('100000000', 'ether')
    );

    console.log("✅ KYC data set for central banks");

    // 8. عرض ملخص النشر
    console.log("\n📊 Deployment Summary");
    console.log("====================");
    console.log(`🪙 MADU Token: ${maduToken.address}`);
    console.log(`🥩 MADU Staking: ${maduStaking.address}`);
    console.log(`💰 Total Supply Cap: ${web3.utils.fromWei(totalSupplyCap, 'ether')} MADU`);
    console.log(`💰 Initial Minted: ${web3.utils.fromWei(initialMintAmount, 'ether')} MADU per country`);
    console.log(`👥 Initial Validators: 3 (one per country)`);
    console.log(`🌍 Network: ${network}`);

    // حفظ العناوين في ملف للمرجعية
    const fs = require('fs');
    const deploymentInfo = {
      network: network,
      timestamp: new Date().toISOString(),
      contracts: {
        MADUToken: maduToken.address,
        MADUStaking: maduStaking.address
      },
      accounts: {
        admin: admin,
        centralBankTunisia: centralBankTunisia,
        centralBankLibya: centralBankLibya,
        centralBankAlgeria: centralBankAlgeria
      },
      initialSupply: {
        totalCap: totalSupplyCap,
        mintedPerCountry: initialMintAmount
      }
    };

    fs.writeFileSync(
      `./deployments/${network}-deployment.json`,
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log(`💾 Deployment info saved to ./deployments/${network}-deployment.json`);
    console.log("\n🎉 MADU Platform deployment completed successfully!");

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    throw error;
  }
};