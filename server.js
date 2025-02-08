const express = require("express");
const cors = require("cors");
const app = express();
const models = require('./models');
const port = 8080;

app.use(express.json());//json형식의 데이터 처리할수 있도록 설정하는 코드
app.use(cors({
  origin: ["https://ashley-three.vercel.app/", "http://localhost:5173"], //허용하는 출처 목록
  credentials: true
})) //브라우저 이슈 막기위한것

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
// const secretKey = crypto.randomBytes(32).toString("hex");
const secretKey = "dkfjoewkfnldksa11";

//=====회원가입
app.post('/users', async (req, res) => {
  const loginBody = req.body;
  console.log('서버에 받은 데이터===', loginBody);
  const { name, user_id, password, passwordConfirm, birth, phone, email, region, store, marry, marketingChecked } = loginBody;

  // 필수값 확인
  if (!name || !user_id || !password || !phone || !email) {
    return res.status(400).send('필수(*) 정보를 입력해주세요');
  }

  // 비밀번호 확인
  if (password !== passwordConfirm) {
    return res.status(400).send('비밀번호가 일치하지 않습니다');
  }

  try {
    // 기존 유저 확인
    const existringUser = await models.User.findOne({ where: { user_id } });
    if (existringUser) {
      return res.status(400).send({ success: false, message: '이미 사용중인 아이디입니다' });
    }

    // 비밀번호 암호화
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);  // 10은 saltRounds

    // 새로운 유저 생성
    const newUser = await models.User.create({
      name,
      user_id,
      password: hashedPassword,
      birth,
      phone,
      // zipcode,
      // address,
      email,
      // marketingChecked,
      region,
      store,
      marry
    });

    res.send({ success: true, user: newUser });
  } catch (error) {
    console.error(error);
    res.status(400).send('회원가입 실패');
  }
});

//=====로그인
app.post("/users/login", (req, res) => {
  const loginBody = req.body;
  console.log('loginBody:', loginBody);  // 로그인 요청 본문을 콘솔에 출력합니다.
  const { user_id, pw } = loginBody; //입력값

  models.User.findOne({
    where: {
      user_id: user_id, //(좌)DB : (우)입력값
    }
  })
  .then((result)=>{
    console.log("정보==", result);
    console.log("아이디==", result.user_id, user_id);
    console.log("비밀번호==", result.pw, pw);

    if(result.user_id === user_id && result.pw === pw){
      console.log("로그인 성공");
      const user = {
        // id: user_id,
        user_key: user_id,
        username: user_id,
      }
      const accessToken = jwt.sign(user, secretKey, {expiresIn: '1h'});
      return res.send({
        user: result.user_id,
        accessToken: accessToken
       });
    } else{
      console.log("로그인 실패");
      return res.status(401).send({
        user: 'False',
        message: '비밀번호가 틀렸습니다'
      }); 
    }
  })
  .catch((err)=>{
    console.log(err);
    return res.status(500).send('서버 에러가 발생했습니다')
  })
})


app.post("/auth", (req, res) => {
  const loginBody = req.body;
  const { accessToken } = loginBody;
  if (!accessToken) {
    console.error("No access token provided.");
    return res.send({ result: false });  // accessToken이 없으면 false 반환
  } else {
    try {
      const decoded = jwt.verify(accessToken, secretKey);
      if (decoded && decoded.exp > Math.floor(Date.now() / 1000)) { //.exp = 만료시간
        console.log("Token is valid:", decoded);
        return res.send({ result: decoded });
      } else {
        console.error("검증실패 Token expired");
        return res.send({ result: false });
      }
    } catch (err) {
      console.erre(err);
      return res.send({ result: false });
    } //검증실패
  }
})

//=====중복확인
app.get('/users/check-id', (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).send({ success: false, message: '아이디를 입력하세요' })
  }
  //데이터베이스에서 아이디 검색
  models.User.findOne({
    where: { user_id },
  }).then((user) => {
    if (user) {
      res.send({ success: false, message: '이미 사용중인 아이디입니다' })
    } else {
      res.send({ success: true, message: '사용 가능한 아이디입니다' })
    }
  }).catch((error) => {
    console.error(error);
    res.send({ success: false, message: '서버 오류가 발생했습니다' })
  })
})

//=====
app.listen(port, () => {
  console.log("서버 정상");
  models.sequelize
    .sync() //db연결
    .then(() => {
      console.log("DB연결 성공")
    })
    .catch((err) => {
      console.error(err);
      process.exit();
    })
})