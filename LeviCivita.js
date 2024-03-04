// LeviCivita.js
// (c) 2009 B. Crowell and M. Khafateh, GPL 2 license
//
// This file provides a constructor, com.lightandmatter.LeviCivita.
//
// to do:
//   implement ln, inverse trig

var com;
if (!com) {com = {};}
if (!com.lightandmatter) {com.lightandmatter = {};}


com.lightandmatter.LeviCivita =
  function (front,leading,series) { // series arg is optional
    var c = {};

    // form is front*d^leading*(sum a_q*d^q), where all q's are >0
    c.f = front; // can be real or complex
    c.l = leading;  // can be Rational or an integer represented in floating point
    if (arguments.length<3) {series = [[0,1]];}
    c.s = series; // array of pairs of the form [q,a_q]; q's can be Rational or integer, and a_q's can be real or complex; first pair must be [0,1]; must be sorted
                  // 0 is represented with front=0 and s=[[0,1]]
                  // NaN is represented with front=NaN; can test with Num.is_invalid()
    c.mytype = 'l';
    c.rr = com.lightandmatter.Rational(1,1); // just need one handy to get access to class methods
    c.nn = com.lightandmatter.Num;           // ...similar

    c.clone = function () {
      var x = com.lightandmatter.LeviCivita(c.f,c.l,[]);
      for (var i in c.s) {
        var q = c.s[i][0];
        var a = c.s[i][1];
        x.s.push([q,a]);
      }
      return x;
    };
    c.zero = function () {
      return com.lightandmatter.LeviCivita(0.0,0);
    };
    c.toString = function() {
      if (c.nn.is_invalid(c)) {return '';}
      if (c.f===0) {return '0';}
      var l = [];
      for (var i=0; i<c.s.length && i<com.lightandmatter.LeviCivita.n_display; i++) {
        var q = c.s[i][0];
        var a = c.s[i][1];
        var power = c.nn.binop('+',q,c.l);
        var coeff = c.nn.binop('*',c.f,a);
        if (coeff!==0) {
          var s = coeff.toString();
          if (c.nn.num_type(coeff)!='r' && s.length>1) {
            s = '('+s+')';
          }
          var p0 = c.nn.binop('==',power,0);
          var p1 = c.nn.binop('==',power,1);
          if (s=='1' && !p0) {s='';}
          if (s=='-1' && !p0) {s='-';}
          if (!p0) {s = s + 'd';}
          if (!p0 && !p1) {s = s + '<sup>' + power + '</sup>';}
          l.push(s);
        }
      }
      return l.join('+');
    };
    c.abs = function() {
      var z = c.clone();
      if (c.nn.num_type(z.f)=='r') {z.f=Math.abs(z.f);} else {z.f=z.f.abs();}
      return z;
    };
    c.neg = function() {
      var z = c.clone();
      z.f = c.nn.binop('-',0,z.f);
      return z;
    };
    c.add = function (b) {
      if (c.f===0) {return b;} // Otherwise we divide by zero below.
      var z = c.clone();
      var h = c.nn.binop('-',b.l,c.l);
      var ff = c.nn.binop('/',b.f,c.f);
      for (var i in b.s) {
        var q = c.nn.binop('+',b.s[i][0],h);
        //c.debug("multiplying "+b.s[i][1]+" * "+ff);
        var a = c.nn.binop('*',b.s[i][1],ff);
        //c.debug("...result = "+a);
        z.s.push([q,a]);
      }
      z.tidy();
      return z;
    };
    c.sub = function (b) {
      return c.add(b.neg()); // add() handles tidying
    };
    c.eq = function(b) {
      if (c.f != b.f) {return false;}
      if (c.l != b.l) {return false;}
      if (c.s.length != b.s.length) {return false;}
      for (var i in c.s) {
        if (!c.nn.binop('==',c.s[i][0],b.s[i][0])) {return false;}
        if (!c.nn.binop('==',c.s[i][1],b.s[i][1])) {return false;}
      }
      return true;
    };
    c.is_real = function() {
      if (!c.nn.is_real(c.f)) {return false;}
      for (var i in c.s) {
        if (!c.nn.is_real(c.s[i][1])) {return false;}
      }
      return true;
    };
    c.force_real = function () {
      if (!c.nn.is_real(c.f)) {c.f=c.f.x;}
      for (var i in c.s) {
        if (!c.nn.is_real(c.s[i][1])) {c.s[i][1].y=0;}
      }
      c.tidy();
    };
    c.cmp = function (b) {
      if (!(c.is_real() && b.is_real())) {return null;}
      if (c.f===0 && b.f===0) {return 0;}
      if ((c.f===0 && b.f!==0) || (c.f!==0 && b.f===0)) {return c.nn.binop('cmp',c.f,b.f);}
      // From this point on, we know they're both real (not complex), and both nonzero.
      if (c.f<0 && b.f>0) {return -1;}
      if (c.f>0 && b.f<0) {return 1;}
      if (c.f<0 && b.f<0) {return -c.neg().cmp(b.neg());}
      // From this point on, we know they're both real (not complex), and both positive.
      var ll = c.nn.binop('cmp',c.l,b.l);
      if (ll!==0) {return -ll;}
      var ff = c.nn.binop('cmp',c.f,b.f);
      if (ff!==0) {return ff;}
      return c.nn.binop('cmp',c.nn.binop('-',c,b),0);
    };
    c.mul = function (b) {
      if (c.nn.is_zero(c) || c.nn.is_zero(b)) {return 0;}
      var z = com.lightandmatter.LeviCivita(c.nn.binop('*',b.f,c.f),c.nn.binop('+',b.l,c.l));
      z.s = [];
      for (var i in b.s) {
        for (var j in c.s) {
          var q = c.nn.binop('+',b.s[i][0],c.s[j][0]);
          var a = c.nn.binop('*',b.s[i][1],c.s[j][1]);
          z.s.push([q,a]);
        }
      }
      z.tidy();
      //c.debug('in mul, after tidy() z.s[0][0]='+z.s[0][0]);
      return z;
    };
    c.sq = function () {
      return c.mul(c);
    };
    c.eps_part = function() { // return the part of the series that's infinitesimal compared to the leading term
      var e = c.clone();
      e.f = 1;
      e.l = 0;
      return c.nn.binop('-',e,1);
    };
    c.expand = function(t) { // expand a Taylor series; t is an array containing the coefficients
      var s = c.zero();
      var pow = com.lightandmatter.LeviCivita(1,0); // =c^i
      var m = t.length;
      for (var i=0; i<m; i++) {
        var term = c.nn.binop('*',t[i],pow);
        s = c.nn.binop('+',s,term);
        if (i<m-1) {pow = c.nn.binop('*',pow,c);} // compute the next one, but only if this isn't the last one
      }
      return s;
    };
    c.to_array = function() { // array operator
      var a = [];
      for (var i=0; i<c.s.length && i<com.lightandmatter.LeviCivita.n_display; i++) { // use n_display, not n, so that we can test for equality using arrays in test suite
        var b = [c.s[i][0],c.s[i][1]]; // rebuild it, because otherwise we get a reference that gets modified
        b[0] = c.nn.binop('+',b[0],c.l);
        b[1] = c.nn.binop('*',b[1],c.f);
        a[i] = b;
      }
      return a;
    };
    c.inv = function() {
      var z = c.clone();
      z.f = c.nn.binop('/',1,z.f); // invert front
      z.l = c.nn.binop('-',0,z.l);//negate
      z.s = [[0,1]];
      // reduce it to inverting 1/(1-e):
      return c.nn.binop('*',z,c.eps_part().neg().expand(com.lightandmatter.LeviCivita.taylor.inv));
    };
    c.div = function (b) {
      return c.nn.binop('*',c,b.inv());
    };
    c.int_pow = function(p) { // c^p, p is an integer; for internal use only; check for 0^0 before calling this function
        // Do these first for efficiency in the case of largish exponents, calling recursively:
        if (p===0) {return com.lightandmatter.LeviCivita(1.0,0.0);} // 0^0 not allowed as input
        if (p==1) {return c;}
        if (p==2) {return c.sq();}
        if (c.f===0) {
          if (p>0) {return 0;}
          if (p<0) {return NaN;}
        }
        // From here on, we know that neither c nor p is zero.
        if (p<0) {return c.int_pow(-p).inv();}
        // If we get to here, p is >=3 and the base c is nonzero.
        var m = Math.floor(p/2.0);
        var n = p-2*m; // may be 0 or 1
        return c.int_pow(m).sq().mul(c.int_pow(n));
    };
    c.pow = function(b) { // compute c**b; b must be integer or Rational unless c.l==0
      if (c.nn.num_type(c)=='r' && isNaN(c)) {return NaN;}
      var bt = c.nn.num_type(b);
      if (bt!='r' && bt!='q' && bt!='l') {return NaN;}
      if (bt=='l') {
        // Both b and c are LC.
        if (c.l!==0) {return NaN;}
        return  c.nn.binop('*',b,c.ln()).exp();
      }
      if (bt=='r') {
        if (c.f===0 && b===0) {return NaN;}
        if (b==Math.floor(b)) {return c.int_pow(b);} else {if (c.l!==0) {return NaN;}}
      }
      if (bt=='q' && b.x!=1) {
        return c.int_pow(b.x).pow(com.lightandmatter.Rational(1,b.y));
      }
      var p;
      if (bt=='r') {p=b;}
      if (bt=='q') {p=b.x/b.y;}
      // series = 1,p,p*(p-1)/2,p*(p-1)*(p-2)/6,...
      //   i.e., Taylor series of y=x^p, evaluated around x=1
      var f = function(i,u) { if (i===0) { return 1; } else { return u*(p-i+1)/i; } };
      t = com.lightandmatter.LeviCivita.generate_taylor(f);
      var z = c.clone();
      // c.debug("debugging... z.f="+z.f+", type="+c.nn.num_type(z.f));
      if (c.nn.num_type(z.f)=='r' && z.f<0) {
        z.f=com.lightandmatter.Complex(z.f,0); // promote to complex
        z.f = c.nn.binop('^',z.f,p);
        if (Math.abs(z.f.x)<1.0e-15) {z.f.x=0;} // kludgy, get rid of small imaginary part
      }
      else {
        z.f = c.nn.binop('^',z.f,p);
      }
      // c.debug("debugging... z.f="+z.f);
      if (!c.nn.is_zero(z.l)) {z.l = c.nn.binop('/',z.l,b.y);} // if z.l is nonzero, we're guaranteed that b is rational
      z.s = [[0,1]];
      return c.nn.binop('*',z,c.eps_part().expand(t));
    };
    c.exp = function() {
        //c.debug('c='+c+' c.l='+c.l+' c.f='+c.f+' c.s[0][0]='+c.s[0][0]);
        if (c.nn.binop('cmp',c.l,0)<0) {return NaN;} // can't do exp(d^-x)
        var ft = c.nn.num_type(c.f);
        var magf;
        if (ft=='r') {magf=Math.abs(c.f);}
        if (ft=='q' || ft=='c') {magf=c.f.abs();}
        var tmagf = c.nn.num_type(magf);
        var argf = 1;
        var u = 1;
        if (ft=='c') {argf=c.f.arg(); u = com.lightandmatter.Complex(Math.cos(argf),Math.sin(argf));}
        var z = c.clone();
        if (c.nn.binop('cmp',magf,1)!==0) {z.f=u; return z.exp().pow(magf);}
        // From now on, we're guaranteed that magf is 1.
        return z.expand(com.lightandmatter.LeviCivita.taylor.exp);
    };
    c.ln = function() {
      if (c.nn.binop('cmp',c.l,0)!==0) {return NaN;}
      var flog;
      if (c.nn.num_type(c.f)=='r' && c.f<0) {c.f=com.lightandmatter.Complex(c.f,0);}
      if (c.nn.num_type(c.f)=='r') {flog=Math.log(c.f);}
      if (c.nn.num_type(c.f)=='c') {flog=c.f.ln();}
      return c.nn.binop('+',flog,c.eps_part().expand(com.lightandmatter.LeviCivita.taylor.ln));
      
    };
    c.cos = function() {
      var u = c.nn.binop('*',c,com.lightandmatter.Complex(0,1)).exp();
      var y = c.nn.binop('/',c.nn.binop('+',u,u.inv()),2);
      if (c.is_real() && !c.nn.is_real(y)) {y.force_real();}
      return y;
    };
    c.sin = function() {
      var u = c.nn.binop('*',c,com.lightandmatter.Complex(0,1)).exp();
      var y = c.nn.binop('/',c.nn.binop('-',u,u.inv()),com.lightandmatter.Complex(0,2));
      if (c.is_real() && !c.nn.is_real(y)) {y.force_real();}
      return y;
    };
    c.tan = function() {
      var y = c.nn.binop('/',c.sin(),c.cos());
      if (c.is_real() && !c.nn.is_real(y)) {y.force_real();}
      return y;
    };
    c.cosh = function() {
      var u = c.exp();
      var y = c.nn.binop('/',c.nn.binop('+',u,u.inv()),2);
      if (c.is_real() && !c.nn.is_real(y)) {y.force_real();}
      return y;
    };
    c.sinh = function() {
      var u = c.exp();
      var y = c.nn.binop('/',c.nn.binop('-',u,u.inv()),2);
      if (c.is_real() && !c.nn.is_real(y)) {y.force_real();}
      return y;
    };
    c.tanh = function() {
      var y = c.nn.binop('/',c.sinh(),c.cosh());
      if (c.is_real() && !c.nn.is_real(y)) {y.force_real();}
      return y;
    };
    c.sqrt = function() {
      return c.pow(com.lightandmatter.Rational(1,2));
    };
    c.tidy = function() {
      c.s.sort(function(a,b) {return c.nn.binop('cmp',a[0],b[0]);});
      var ss = [];
      var last_q = null;
      for (var i=0; i<c.s.length; i++) {
        if (c.nn.binop('cmp',c.s[i][0],last_q)===0) {
          ss[ss.length-1][1] = c.nn.binop('+',ss[ss.length-1][1],c.s[i][1]);
        }
        else {
          ss.push(c.s[i]);
        }
        last_q = c.s[i][0];
      }
      c.s = ss;
      for (var i=0; i<c.s.length; i++) {
        if (c.nn.is_zero(c.s[i][1])) {
           c.s.splice(i,1);
        }
      }
      if (c.s.length===0) {c = c.zero();}
      c.s.splice(com.lightandmatter.LeviCivita.n); // truncate to n terms
      var k = c.s[0][1];
      c.f = c.nn.binop('*',c.f,k);
      for (var i=0; i<c.s.length; i++) {
        c.s[i][1] = c.nn.binop('/',c.s[i][1],k);
        if (c.nn.num_type(c.s[i][1])=='q') {c.s[i][1]=c.s[i][1].tidy();}
      }
      if (c.s[0][0]!==0) {
        var p = c.s[0][0];
        c.l = c.nn.binop('+', c.l, p);
        for (var i=0; i<c.s.length; i++) {
          c.s[i][0] = c.nn.binop('-', c.s[i][0], p);
        }
      }
      //c.debug('in tidy() c.s[0][0]='+c.s[0][0]);
    };

    c.debug = function(s) {
      document.getElementById("debug").innerHTML=document.getElementById("debug").innerHTML+' '+s+' ';
    };

    return c;

  };



com.lightandmatter.LeviCivita.generate_taylor = function (f) {
      var m = com.lightandmatter.LeviCivita.n;
      var t = [];
      var l = null;
      for (var i=0; i<m; i++) {
        l = f(i,l);
        t.push(l);
      }
      return t;
    };

com.lightandmatter.LeviCivita.generate_static_taylors = function () {
    var x = com.lightandmatter.LeviCivita;
    x.taylor = {};
    x.taylor.inv = x.generate_taylor(function(){return 1;}); // 1/(1-x)
    x.taylor.exp = x.generate_taylor(function(i,l){if (i===0) {return 1;} else {return l/i;}}); // e^x
    x.taylor.ln  = x.generate_taylor(function(i,l){if (i===0) {return 0;} if (i===1) {return 1;} else {var sign=-l/Math.abs(l); return sign/i;}}); // ln(1+x)
};

com.lightandmatter.LeviCivita.change_n = function (n) {
  if (arguments.length===0) {return com.lightandmatter.LeviCivita.n_display;}
  com.lightandmatter.LeviCivita.n_display = n;
  com.lightandmatter.LeviCivita.n = 2*n;
  com.lightandmatter.LeviCivita.generate_static_taylors();

  // com.lightandmatter.LeviCivita.n is number of terms to keep in the series
  //com.lightandmatter.LeviCivita.n_display --
  //    only display this many, so the user isn't likely to see the results of truncation; also, only use this many terms in results of array operator
  // I think n should be twice as big as n_display in most cases. Test with, e.g., sqrt(d+d^2)^2.
  // Would probably be better to maintain explicit error bounds.
  // When changing either of these on the fly, need to call generate_static_taylors().

};

com.lightandmatter.LeviCivita.change_n(5);
