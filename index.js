const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const axios = require("axios");
require("dotenv").config();

const app = express().use(bodyParser.json());

const port = process.env.PORT;
const token = process.env.TOKEN;
const mytoken = process.env.MY_TOKEN;

// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;

//session middleware
app.use(
  sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookie parser middleware
app.use(cookieParser());

// a variable to save a session
var session;

app.listen(port, () => {
  console.log(`webhook is listening on port ${port}`);
});

app.get("/webhooks", (req, res) => {
  let mode = req.query["hub.mode"];
  let challenge = req.query["hub.challenge"];
  let token = req.query["hub.verify_token"];

  console.log(JSON.stringify(token, null, 2));

  if (mode && token) {
    if (mode === "subscribe" && token === mytoken) {
      console.log(JSON.stringify(token, null, 2));
      res.status(200).send(challenge);
    } else {
      res.status(403);
    }
  }
});

app.post("/webhooks", (req, res) => {
  let body_param = req.body;

  console.log(JSON.stringify(body_param, null, 2));

  if (body_param.object) {
    if (
      body_param.entry &&
      body_param.entry[0].changes &&
      body_param.entry[0].changes[0].value.messages &&
      body_param.entry[0].changes[0].value.messages[0]
    ) {
      let phon_no_id =
        body_param.entry[0].changes[0].value.metadata.phone_number_id;
      let from = body_param.entry[0].changes[0].value.messages[0].from;
      let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;

      console.log("phone number " + phon_no_id);
      console.log("from " + from);
      console.log("boady param " + msg_body);

      session = req.session;
      session.userid = phon_no_id;
      console.log(req.session);
      console.log(session.userid);
      axios({
        method: "POST",
        url:
          "https://graph.facebook.com/v17.0/" +
          phon_no_id +
          "/messages?access_token=" +
          token,
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: {
            body: `Cool! 👏
            Let's Start With Your First Name.`,
          },
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      res.sendStatus(200);
    }
    if (
    //   body_param.entry &&
    //   body_param.entry[0].changes &&
    //   body_param.entry[0].changes[0].value.messages &&
    //   body_param.entry[0].changes[0].value.messages[0] &&
      req.session.userid 
    ) {
      let phon_no_id =
        body_param.entry[0].changes[0].value.metadata.phone_number_id;
      let from = body_param.entry[0].changes[0].value.messages[0].from;
      let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;

      console.log("phone number " + phon_no_id);
      console.log("from " + from);
      console.log("boady param " + msg_body);

      session = req.session;
      session.msg_body = req.body.msg_body;
      console.log(req.session);
      console.log(req.session.msg_body);

      axios({
        method: "POST",
        url:
          "https://graph.facebook.com/v17.0/" +
          phon_no_id +
          "/messages?access_token=" +
          token,
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: {
            body: `Nice to meet you ${msg_body}🤝
              What is your LastName?`,
          },
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  }
});

app.get("/", (req, res) => {
  console.log("hello this is webhook setup");
  res.status(200).send("hello this is webhook setup");
});
