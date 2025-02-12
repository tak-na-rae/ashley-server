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
      addr1: { //[#]선택
        type: DataTypes.STRING(10), // 숫자나 문자열로 처리
        allowNull: true,
      },
      addr2: { //[#]선택
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
      marry: { //[#]선택
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      join_terms1 : {
        type: DataTypes.TINYINT(1), //true,false
        allowNull: false, 
      },
      join_terms2 : {
        type: DataTypes.TINYINT(1), //true,false
        allowNull: false, 
      },
      join_terms3 : { //[#]선택
        type: DataTypes.BOOLEAN,
        allowNull: true, 
      },
      join_terms4 : {
        type: DataTypes.TINYINT(1),
        allowNull: false, 
      },
      join_mk_mail : { //[#]선택
        type: DataTypes.TINYINT(1),
        allowNull: true, 
      },
      join_mk_sms : { //[#]선택
        type: DataTypes.TINYINT(1),
        allowNull: true, 
      },
      join_mk_dm : { //[#]선택
        type: DataTypes.TINYINT(1),
        allowNull: true, 
      },
      join_mk_coupon : { //[#]선택
        type: DataTypes.TINYINT(1),
        allowNull: true, 
      },
    },
    {
      timestamps: false, //createdAt, updatedAt 생성 방지
    }
  );
  return user;
};