module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    "User",
    {
      user_key: {
        // id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
      name: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      user_id: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      birth: { //[#]선택
        type: DataTypes.STRING(30),
        allowNull: true, 
      },
      phone: {
        type: DataTypes.STRING(30),
        allowNull: false, // 필수 입력
      },
      zipcode: { //[#]선택
        type: DataTypes.STRING(10), // 숫자나 문자열로 처리
        allowNull: true,
      },
      address: { //[#]선택
        type: DataTypes.STRING(30),
        allowNull: true, 
      },
      email: {
        type: DataTypes.STRING(30),
        allowNull: false, 
      },
      region: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      store: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
    },
    {
      timestamps: false, //createdAt, updatedAt 생성 방지
    }
  );
  return user;
};