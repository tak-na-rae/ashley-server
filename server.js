const express = require("express");
const cors = require("cors");
const app = express();
const models = require('./models');
const port = 8080;


app.use(express.json());//json형식의 데이터 처리할수 있도록 설정하는 코드
app.use(cors({
  origin: ["http://ashley-three.vercel.app", "http://localhost:5173"], //허용하는 출처 목록
  credentials: true, // 자격 증명(쿠키, 인증 헤더)을 포함하는 요청 허용
  methods: ['GET', 'POST'], // 허용할 HTTP 메서드
  allowedHeaders: ['Content-Type', 'Authorization'], // 허용할 헤더
  credentials: true // 쿠키, 인증 정보 허용 여부
})) //브라우저 이슈 막기위한것

const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
// const secretKey = "dkfjoewkfnldksa11";
const secretKey = crypto.randomBytes(32).toString("hex");

//=====회원가입
app.post('/users', async (req, res) => {
  const loginBody = req.body;
  console.log('서버에 받은 데이터===', loginBody);
  const { name, user_id, password, passwordConfirm, birth, phone, addr1,addr2, email, region, store, marry,
    join_terms1,join_terms2,join_terms3,join_terms4, join_mk_mail,join_mk_sms,join_mk_dm,join_mk_coupon } = loginBody;

  // 필수값 확인
  if (!name || !user_id || !password || !phone || !email || !region || !store) {
    return res.status(400).send("필수(*) 정보를 입력해주세요");
  }

  // 비밀번호 확인
  if (password !== passwordConfirm) {
    return res.status(400).send("비밀번호가 일치하지 않습니다");
  }

  if(!join_terms1 || !join_terms2 || !join_terms4){
    return res.status(400).send("약관 동의 [필수]를 체크해주세요")
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
      addr1,
      addr2,
      email,
      region,
      store,
      marry,
      join_terms1,join_terms2,join_terms3,join_terms4,
      join_mk_mail,join_mk_sms,join_mk_dm,join_mk_coupon
    });

    res.send({ success: true, user: newUser });
  } catch (error) {
    console.error(error);
    res.status(400).send('회원가입 실패');
  }
});

//=====로그인
app.post("/users/login", async (req, res) => {
  const loginBody = req.body;
  console.log('loginBody:', loginBody);
  const { userId,userPassword } = loginBody; //입력값

  // models.User.findOne({
  //   where: {
  //     user_id: userId, //(좌)DB : (우)입력값
  //   }
  // })
  // .then((result)=>{
    try {
      const result = await models.User.findOne({
        where: {
          user_id: userId, //(좌)DB : (우)입력값
        }
      })
    console.log("정보==", result);

    if (!result) {
      console.log("아이디 존재하지 않음");
      return res.status(404).send({
        type: "id",
        user: "false",
        message: '존재하지 않는 계정입니다',
      });
    }
    
    bcrypt.compare(userPassword, result.password, (err, isMatch) => {
      if (err) {
        console.error("비밀번호 비교 오류:", err);
        return res.status(500).send("서버 오류");
      }

      if (isMatch) {
        console.log("로그인 성공");
        const user = {
          user_key: userId,
          user_name: userId,
        };
        const accessToken = jwt.sign(user, secretKey, { expiresIn: '1h' });
        return res.send({
          user: result.user_id,
          accessToken: accessToken,
        });
      } else {
        console.log("로그인 실패!!!! 비밀번호 틀림");
        return res.status(401).send({
          type: "pw",
          user: "false",
          message: '잘못된 비밀번호입니다',
        });
      }
    });

    // if(result.user_id === user_id && result.password === password){
    //   console.log("로그인 성공");
    //   const user = {
    //     // id: user_id,
    //     user_key: user_id,
    //     username: user_id,
    //   }
    //   const accessToken = jwt.sign(user, secretKey, {expiresIn: '1h'});
    //   return res.send({
    //     user: result.user_id,
    //     accessToken: accessToken
    //    });
    // } else{
    //   console.log("로그인 실패");
    //   return res.status(401).send({
    //     user: 'False',
    //     message: '비밀번호가 틀렸습니다'
    //   }); 
    // }

  }
  catch(err){
  // .catch((err)=>{
    console.log(err);
    return res.status(500).send('서버 에러가 발생했습니다')
  }
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
      console.error(err);
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

//=====마이페이지
app.get("/users/mypage", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];  // 요청 헤더에서 Authorization 토큰 가져오기
    if (!token) {
      return res.status(401).send("토큰이 없습니다");
    }

    const decoded = jwt.verify(token, secretKey); // 토큰 검증
    const userId = decoded.user_key; // 토큰에서 user_id 추출

    const user = await models.User.findOne({ // 유저 정보 조회
      where: { user_id: userId },
      attributes: { exclude: ["password"] } // 비밀번호 제외하고 반환
    });

    if (!user) {
      return res.status(404).send("유저 정보를 찾을 수 없습니다");
    }

    res.send(user); // 클라이언트에 유저 정보 반환
  } catch (error) {
    console.error(error);
    res.status(500).send("서버 오류 발생");
  }
});


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