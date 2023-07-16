//sensitive data should not be stored on client side browser because user can easily manipulate them..
//cookies can be manipulated on client side browser..
//hence we'll store the info in sessions..

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const {validationResult} = require('express-validator'); //as the check provides you with so many things, you are simply fetching whatever you want..

const User = require('../models/user');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth:{
    user: 'riyaadutta03@gmail.com',
    pass: 'wgywzpociiriwuac'
  }
});


exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if(message.length > 0){
    message = message[0];
  }else
  {
    message = null;
  }

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage : message,
    oldInput: {
      email: '',
      password: ''
    },
    validationErrors: []
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if(message.length > 0){
    message = message[0];
  }else
  {
    message = null;
  }

  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage : message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if(!errors.isEmpty()){
    console.log(errors.array());
    return res.status(422).render('auth/login', {
    path: '/login',
    pageTitle: 'login',
    errorMessage : errors.array()[0].msg,
    oldInput: { 
       email: email,
       password: password
      },
      validationErrors: errors.array() 
  });
}

  User.findOne({email: email})
    .then(user => {
      if(!user){
        console.log(errors.array());
        return res.status(422).render('auth/signup', {
          path: '/signup',
          pageTitle: 'Signup',
          errorMessage : errors.array()[0].msg,
          oldInput: { 
             email: email,
             password: password
            },
            validationErrors: errors.array()
      })
    }

      bcrypt.compare(password, user.password) //here we are comparing the password user has passed with the password stored in database
      .then(result => {  //we'll go to the catch only when something gets wrong, if passwd matches/unmatches we will end up in then block only..
        if(result)
        {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save(err => {
          console.log(err);
          res.redirect('/');
          });
        }
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage : errors.array()[0].msg,
          oldInput: { 
             email: email,
             password: password
            },
          validationErrors: errors.array()[0].msg
      })
      })
      .catch(err => console.log(err));;
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword ;
  
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    // console.log(errors.array())
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage : errors.array()[0].msg,
      oldInput: { 
        email: email,
        password: password,
        confirmPassword: confirmPassword 
       },
      validationErrors: errors.array()
    });
  }

    bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items:[]}
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
      return transporter.sendMail({
        from: 'riyaadutta03@gmail.com',
        to: email,
        subject: 'Signup succeeded',
        html: '<h1>You successfully signed up</h1>'
      })
    })
    .catch(err => {
      console.log(err);
    }); //first arg is the string you want to hash, second value is the salt value..
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req,res,next) => {
  let message = req.flash('error');
  if(message.length > 0){
    message = message[0];
  }else
  {
    message = null;
  }

  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage : message
  });
}

exports.postReset = (req,res,next) => {
  crypto.randomBytes(32, (err, buffer)=>{
    if(err){
      console.log(err);
      return res.redirect('/reset');
    }

    const token = buffer.toString('hex'); //buffer stores hexadecimal characters
    User.findOne({email: req.body.email})
    .then(user => {
      if(!user){
        req.flash('error','No account with that email found.');
        return res.redirect('/reset');
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000; //(current time + 1 hour)
      return user.save();
    })
    .then(result => {
      res.redirect('/');
      transporter.sendMail({
        from: 'riyaadutta03@gmail.com',
        to: req.body.email,
        subject: 'Password Reset',
        html: `<p>You requested password reset.</p>
        <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>`
      })
    })
    .catch(err => console.log(err));
  })
};

exports.getNewPassword = (req,res,next) => {
  const token = req.params.token;
  User.findOne({resetToken: token, resetTokenExpiration: {$gt : Date.now()}})
  .then(user => {
  let message = req.flash('error');
  if(message.length > 0){
    message = message[0];
  }else
  {
    message = null;
  }

  res.render('auth/new-password', {
    path: '/new-password',
    pageTitle: 'New Password',
    errorMessage : message,
    userId: user._id.toString(),
    passwordToken: token //so that user don't enter random token in the url and by any chance reach the new password page..
  });
  })
  .catch(err => console.log(err)); //gt stands for greater than, if token hasn't expired yet, we can reset the password.. 
}

exports.postNewPassword = (req,res,next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({resetToken: passwordToken, resetTokenExpiration: {$gt : Date.now()}, _id : userId})
  .then(user => {
    resetUser = user;
    return bcrypt.hash(newPassword,12);
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save();
  })
  .then(result => {
    res.redirect('/login');
  })
  .catch(err => console.log(err));
}