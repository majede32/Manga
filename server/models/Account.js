const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  accountNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      len: [10, 20]
    }
  },
  type: {
    type: DataTypes.ENUM('جاري', 'ادخار', 'استثمار'),
    allowNull: false,
    defaultValue: 'جاري'
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'TND',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('نشط', 'معلق', 'مغلق'),
    defaultValue: 'نشط',
    allowNull: false
  },
  interestRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'accounts'
});

// إنشاء رقم حساب فريد
Account.beforeCreate(async (account) => {
  if (!account.accountNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    account.accountNumber = `TN${timestamp}${random}`;
  }
});

// العلاقة مع المستخدم
User.hasMany(Account, { foreignKey: 'userId', as: 'accounts' });
Account.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Account;