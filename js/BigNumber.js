(function(){
/*
Written in 2013 by Peter O.

Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://upokecenter.com/d/
 */
if(typeof StringBuilder=="undefined"){
var StringBuilder=function(){
this.str="";
}
}
StringBuilder.prototype.append=function(ch){
if(typeof ch=="number")
 this.str+=String.fromCharCode(ch);
else
 this.str+=ch
}
StringBuilder.prototype.length=function(){
return this.str.length
}
StringBuilder.prototype.charAt=function(index){
// Get the character code, since that's what the caller expects
return this.str.charCodeAt(index)
}
StringBuilder.prototype.toString=function(){
return this.str;
}
if(typeof JSInteropFactory=="undefined"){
var JSInteropFactory={};
}
/////////////////////////////////////
// Adapted by Peter O. from CryptoPP by Wei Dai
JSInteropFactory.divideFourWordsByTwo=function(dividend, divisor){
 var t0=(dividend.lo&0xFFFF);
 var t1=(dividend.lo>>>16);
 var t2=(dividend.hi&0xFFFF);
 var t3=(dividend.hi>>>16);
 var b0=(divisor&0xFFFF);
 var b1=(divisor>>>16);
 var ret=JSInteropFactory.divideThreeWordsByTwo(t1,t2,t3,b0,b1);
 var qhigh=ret[0];
 ret=JSInteropFactory.divideThreeWordsByTwo(t0,ret[1],ret[2],b0,b1);
 var qlow=ret[0];
 return [(qlow|(qhigh<<16))>>>0,(ret[1]|(ret[2]<<16))>>>0];
}

// Adapted by Peter O. from CryptoPP by Wei Dai
JSInteropFactory.divideThreeWordsByTwo=function(a0,a1,a2,b0,b1){
  var q=0;
  if(b1==0xFFFF)
   q=a2;
  else if(b1>0)
   q=((((a1|(a2<<16))>>>0)/((b1+1)&0xFFFF))&0xFFFF)|0;
  else
   q=((((a1|(a2<<16))>>>0)/b0)&0xFFFF)|0;
  var p=(b0*q)>>>0;
  var u=(a0-(p&0xFFFF))>>>0;
  a0=(u&0xFFFF);
  u=(a1-(p>>>16)-(((0-(u>>>16)))&0xFFFF)-((b1*q)>>>0))>>>0;
  a1=(u&0xFFFF);
  a2=((a2+(u>>>16))&0xFFFF);
  while(a2!=0 || a1>b1 || (a1==b1 && a0>=b0)){
   u=(a0-b0)>>>0;
   a0=(u&0xFFFF);
   u=(a1-b1-(((0-(u>>>16)))&0xFFFF))>>>0;
   a1=(u&0xFFFF);
   a2=((a2+(u>>>16))&0xFFFF);
   q++;
   q&=0xFFFF;
  }
  return [q,a0,a1,a2]
}

JSInteropFactory.divide64By32=function(dividendLow,dividendHigh,divisor){
  var remainder=0
  var currentDividend=new ILong(dividendHigh,0);
  var result=JSInteropFactory.divideFourWordsByTwo(currentDividend,divisor);
  var quotientHigh=result[0];
  remainder=result[1];
  currentDividend=new ILong(dividendLow,remainder);
  result=JSInteropFactory.divideFourWordsByTwo(currentDividend,divisor);
  var quotientLow=result[0];
  return new ILong(quotientLow,quotientHigh);
}

/////////////////////////////////////////////
var ILong=function(lo,hi){
// Convert lo and hi to unsigned
this.lo=lo>>>0
this.hi=hi>>>0
}
ILong.prototype.signum=function(){
if((this.lo|this.hi)==0)return 0;
return ((this.hi>>>31)!=0) ? -1 : 1;
}
ILong.prototype.equals=function(other){
 return this.lo==other.lo && this.hi==other.hi
}
ILong.prototype.negate=function(){
var ret=new ILong(this.lo,this.hi);
if((this.lo|this.hi)!=0)ret._twosComplement();
return ret;
}
ILong.prototype.or=function(other){
return new ILong(this.lo|other.lo,this.hi|other.hi);
}
ILong.prototype.andInt=function(otherUnsigned){
return new ILong(this.lo&(otherUnsigned>>>0),this.hi);
}
ILong.prototype.intValue=function(){
return this.lo|0;
}
ILong.prototype.shortValue=function(){
return (this.lo|0)&0xFFFF;
}
ILong.prototype.compareToLongAsInts=function(otherLo,otherHi){
 otherHi|=0;
 // Signed comparison of high words
 if(otherHi!=(this.hi|0)){
  return (otherHi>(this.hi|0)) ? -1 : 1;
 }
 otherLo=otherLo>>>0;
 // Unsigned comparison of low words
 if(otherLo!=this.lo){
  return (otherLo>this.lo) ? -1 : 1;
 }
 return 0;
}
ILong.prototype.compareToInt=function(other){
 other|=0;
 var otherHi=(other<0) ? -1 : 0;
 // Signed comparison of high words
 if(otherHi!=(this.hi|0)){
  return (otherHi>(this.hi|0)) ? -1 : 1;
 }
 other=other>>>0;
 // Unsigned comparison of low words
 if(other!=this.lo){
  return (other>this.lo) ? -1 : 1;
 }
 return 0;
}
ILong.prototype.equalsInt=function(other){
 if(other<0){
  return (~this.hi)==0 && this.lo==(other>>>0);
 } else {
  return this.hi==0 && this.lo==(other>>>0);
 }
}
ILong.prototype._twosComplement=function(){
 if(this.lo==0){
  this.hi=((this.hi-1)>>>0);
 }
 this.lo=((this.lo-1)>>>0);
 this.lo=(~this.lo)>>>0;
 this.hi=(~this.hi)>>>0;
}
ILong.prototype.remainderWithUnsignedDivisor=function(divisor){
 if((this.hi>>>31)!=0){
  // value is negative
  var ret=new ILong(this.lo,this.hi);
  ret._twosComplement();
  // NOTE: since divisor is unsigned, overflow is impossible
  ret=ret._remainderUnsignedDividendUnsigned(divisor);
  ret._twosComplement();
  return ret;
 } else {
  return this._remainderUnsignedDividendUnsigned(divisor);
 }
}
ILong.prototype.divideWithUnsignedDivisor=function(divisor){
 if((this.hi>>>31)!=0){
  // value is negative
  var ret=new ILong(this.lo,this.hi);
  ret._twosComplement();
  // NOTE: since divisor is unsigned, overflow is impossible
  ret=ret._divideUnsignedDividendUnsigned(divisor);
  ret._twosComplement();
  return ret;
 } else {
  return this._divideUnsignedDividendUnsigned(divisor);
 }
}

ILong.prototype._divideUnsignedDividendUnsigned=function(divisor){
 divisor|=0;
 if(divisor<0)throw new RuntimeException("value is less than 0");
 if(divisor==1)return this;
		if (this.hi==0){
    return new ILong((this.lo>>>0)/divisor,0);
		} else {
    var rem=JSInteropFactory.divide64By32(this.lo,this.hi,divisor);
    return rem;
		}
}

ILong.prototype._remainderUnsignedDividendUnsigned=function(divisor){
 divisor|=0;
 if(divisor<0)throw new RuntimeException("value is less than 0");
 if(divisor==1)return this;
		if (divisor < 0x10000 || this.hi==0)
		{
    var r=this.hi%divisor;
    r=((this.lo>>>16)|(r<<16))%divisor;
    return new ILong(
      (((this.lo&0xFFFF)|(r<<16))%divisor)&0xFFFF,
      0
    );
		} else {
    var rem=JSInteropFactory.divideFourWordsByTwo(this,divisor);
    return new ILong(rem[1],(rem[1]>>>31)==0 ? 0 : (1<<31));
		}
}

ILong.prototype.shiftLeft=function(len){
 if(len<=0)return this;
 if(len>=64){
  return JSInteropFactory.LONG_ZERO;
 } else if(len>=32){
  return new ILong(0,this.lo<<(len-32));
 } else if(this.lo==0){
  return new ILong(0,this.hi<<len);
 } else {
  var newhigh=this.hi<<len;
  var newlow=this.lo<<len;
  newhigh|=(this.lo>>>(32-len));
  return new ILong(newlow,newhigh);
 }
}
ILong.prototype.shiftRight=function(len){
 if(len<=0)return this;
 if(len>=64){
  return ((this.hi>>>31)!=0) ?
    JSInteropFactory.LONG_MAX_VALUE() :
    JSInteropFactory.LONG_MIN_VALUE();
 } else if(len>=32){
  return new ILong((this.hi>>len-32),((this.hi>>>31)!=0) ? (~0) : 0);
 } else if(this.hi==0){
  return new ILong(this.lo>>>len,0);
 } else {
  var newhigh=this.hi>>len;
  var newlow=this.lo>>>len;
  newlow|=(this.hi<<(32-len));
  return new ILong(newlow,newhigh);
 }
}
JSInteropFactory.createStringBuilder=function(param){
 return new StringBuilder();
}
JSInteropFactory.createLong=function(param){
 if(param.constructor==ILong)return param;
 return new ILong(param,(param<0) ? (~0) : 0);
}
JSInteropFactory.createLongFromInts=function(a,b){
 return new ILong(a>>>0,b>>>0);
}
JSInteropFactory.LONG_MIN_VALUE_=new ILong(0,(1<<31));
JSInteropFactory.LONG_MAX_VALUE_=new ILong(~0,~0);
JSInteropFactory.LONG_MIN_VALUE=function(){
 return JSInteropFactory.LONG_MIN_VALUE_;
}
JSInteropFactory.LONG_MAX_VALUE=function(){
 return JSInteropFactory.LONG_MAX_VALUE_;
}
JSInteropFactory.LONG_ZERO=new ILong(0,0)
var Extras={}
Extras.IntegersToDouble=function(){throw "Not implemented"}
Extras.DoubleToIntegers=function(){throw "Not implemented"}
if(typeof exports!=="undefined"){
exports.Extras=Extras;
exports.JSInteropFactory=JSInteropFactory;
exports.ILong=ILong;
exports.StringBuilder=StringBuilder;
}

var BigInteger =

function() {

};
(function(constructor,prototype){
    constructor['CountWords'] = constructor.CountWords = function(X, N) {
        while (N != 0 && X[N - 1] == 0) N--;
        return (N|0);
    };
    constructor['ShiftWordsLeftByBits'] = constructor.ShiftWordsLeftByBits = function(r, rstart, n, shiftBits) {
        {
            var u, carry = 0;
            if (shiftBits != 0) {
                for (var i = 0; i < n; i++) {
                    u = r[rstart + i];
                    r[rstart + i] = ((((((((((u << (shiftBits|0))|0) | (carry & 65535)))|0)) & 65535))|0));
                    carry = (((u & 65535) >> ((16 - shiftBits)|0))|0);
                }
            }
            return carry;
        }
    };
    constructor['ShiftWordsRightByBits'] = constructor.ShiftWordsRightByBits = function(r, rstart, n, shiftBits) {
        var u, carry = 0;
        {
            if (shiftBits != 0) for (var i = n; i > 0; i--) {
                u = r[rstart + i - 1];
                r[rstart + i - 1] = (((((((((((u & 65535) >> (shiftBits|0)) & 65535) | (carry & 65535)))|0)) & 65535))|0));
                carry = (((u & 65535) << ((16 - shiftBits)|0))|0);
            }
            return carry;
        }
    };
    constructor['ShiftWordsRightByBitsSignExtend'] = constructor.ShiftWordsRightByBitsSignExtend = function(r, rstart, n, shiftBits) {
        {
            var u, carry = ((65535 << ((16 - shiftBits)|0))|0);
            if (shiftBits != 0) for (var i = n; i > 0; i--) {
                u = r[rstart + i - 1];
                r[rstart + i - 1] = ((((((((((u & 65535) >> (shiftBits|0)) | (carry & 65535)))|0)) & 65535))|0));
                carry = (((u & 65535) << ((16 - shiftBits)|0))|0);
            }
            return carry;
        }
    };
    constructor['ShiftWordsLeftByWords'] = constructor.ShiftWordsLeftByWords = function(r, rstart, n, shiftWords) {
        shiftWords = (shiftWords < n ? shiftWords : n);
        if (shiftWords != 0) {
            for (var i = n - 1; i >= shiftWords; i--) r[rstart + i] = (r[rstart + i - shiftWords] & 65535);
            for (var arrfillI = rstart; arrfillI < (rstart) + (shiftWords); arrfillI++) r[arrfillI] = 0;
        }
    };
    constructor['ShiftWordsRightByWords'] = constructor.ShiftWordsRightByWords = function(r, rstart, n, shiftWords) {
        shiftWords = (shiftWords < n ? shiftWords : n);
        if (shiftWords != 0) {
            for (var i = 0; i + shiftWords < n; i++) r[rstart + i] = (r[rstart + i + shiftWords] & 65535);
            rstart = rstart + n - shiftWords;
            for (var arrfillI = rstart; arrfillI < (rstart) + (shiftWords); arrfillI++) r[arrfillI] = 0;
        }
    };
    constructor['ShiftWordsRightByWordsSignExtend'] = constructor.ShiftWordsRightByWordsSignExtend = function(r, rstart, n, shiftWords) {
        shiftWords = (shiftWords < n ? shiftWords : n);
        if (shiftWords != 0) {
            for (var i = 0; i + shiftWords < n; i++) r[rstart + i] = (r[rstart + i + shiftWords] & 65535);
            rstart = rstart + n - shiftWords;
            for (var i = 0; i < shiftWords; i++) r[rstart + i] = (65535 & 65535);
        }
    };
    constructor['Compare'] = constructor.Compare = function(A, astart, B, bstart, N) {
        while ((N--) != 0) {
            var an = (A[astart + N] & 65535);
            var bn = (B[bstart + N] & 65535);
            if (an > bn) return 1; else if (an < bn) return -1;
        }
        return 0;
    };
    constructor['Increment'] = constructor.Increment = function(A, Astart, N, B) {
        {
            var tmp = A[Astart];
            A[Astart] = ((tmp + B) & 65535);
            if ((A[Astart] & 65535) >= (tmp & 65535)) return 0;
            for (var i = 1; i < N; i++) {
                A[Astart + i] = ((A[Astart + i] + 1) & 65535);
                if (A[Astart + i] != 0) return 0;
            }
            return 1;
        }
    };
    constructor['Decrement'] = constructor.Decrement = function(A, Astart, N, B) {
        {
            var tmp = A[Astart];
            A[Astart] = ((tmp - B) & 65535);
            if ((A[Astart] & 65535) <= (tmp & 65535)) return 0;
            for (var i = 1; i < N; i++) {
                tmp = A[Astart + i];
                A[Astart + i] = ((A[Astart + i] - 1) & 65535);
                if (tmp != 0) return 0;
            }
            return 1;
        }
    };
    constructor['TwosComplement'] = constructor.TwosComplement = function(A, Astart, N) {
        BigInteger.Decrement(A, Astart, N, 1);
        for (var i = 0; i < N; i++) A[Astart + i] = ((~A[Astart + i]) & 65535);
    };
    constructor['Add'] = constructor.Add = function(C, cstart, A, astart, B, bstart, N) {
        {
            var u;
            u = 0;
            for (var i = 0; i < N; i += 2) {
                u = (A[astart + i] & 65535) + (B[bstart + i] & 65535) + ((u >> 16)|0);
                C[cstart + i] = ((u & 65535) & 65535);
                u = (A[astart + i + 1] & 65535) + (B[bstart + i + 1] & 65535) + ((u >> 16)|0);
                C[cstart + i + 1] = ((u & 65535) & 65535);
            }
            return ((u|0) >>> 16);
        }
    };
    constructor['Subtract'] = constructor.Subtract = function(C, cstart, A, astart, B, bstart, N) {
        {
            var u;
            u = 0;
            for (var i = 0; i < N; i += 2) {
                u = (A[astart] & 65535) - (B[bstart] & 65535) - ((u >> 31) & 1);
                C[cstart++] = ((u & 65535) & 65535);
                astart++;
                bstart++;
                u = (A[astart] & 65535) - (B[bstart] & 65535) - ((u >> 31) & 1);
                C[cstart++] = ((u & 65535) & 65535);
                astart++;
                bstart++;
            }
            return ((u >> 31) & 1);
        }
    };
    constructor['LinearMultiply'] = constructor.LinearMultiply = function(productArr, cstart, A, astart, B, N) {
        {
            var carry = 0;
            var Bint = (B & 65535);
            for (var i = 0; i < N; i++) {
                var p;
                p = (A[astart + i] & 65535) * Bint;
                p = p + (carry & 65535);
                productArr[cstart + i] = ((p & 65535) & 65535);
                carry = ((p >> 16)|0);
            }
            return carry;
        }
    };
    constructor['Baseline_Square2'] = constructor.Baseline_Square2 = function(R, rstart, A, astart) {
        {
            var p;
            var c;
            var d;
            var e;
            p = (A[astart] & 65535) * (A[astart] & 65535);
            R[rstart] = ((p & 65535) & 65535);
            e = ((p|0) >>> 16);
            p = (A[astart] & 65535) * (A[astart + 1] & 65535);
            c = (p & 65535);
            d = ((p|0) >>> 16);
            d = ((((d << 1) + (((c|0) >> 15) & 1)))|0);
            c <<= 1;
            e = e + (c & 65535);
            c = (e & 65535);
            e = d + ((e|0) >>> 16);
            R[rstart + 4 - 3] = (c & 65535);
            p = (A[astart + 2 - 1] & 65535) * (A[astart + 2 - 1] & 65535);
            p = p + (e);
            R[rstart + 4 - 2] = ((p & 65535) & 65535);
            R[rstart + 4 - 1] = ((p >> 16) & 65535);
        }
    };
    constructor['Baseline_Square4'] = constructor.Baseline_Square4 = function(R, rstart, A, astart) {
        {
            var p;
            var c;
            var d;
            var e;
            p = (A[astart] & 65535) * (A[astart] & 65535);
            R[rstart] = ((p & 65535) & 65535);
            e = ((p|0) >>> 16);
            p = (A[astart] & 65535) * (A[astart + 1] & 65535);
            c = (p & 65535);
            d = ((p|0) >>> 16);
            d = ((((d << 1) + (((c|0) >> 15) & 1)))|0);
            c <<= 1;
            e = e + (c & 65535);
            c = (e & 65535);
            e = d + ((e|0) >>> 16);
            R[rstart + 1] = (c & 65535);
            p = (A[astart] & 65535) * (A[astart + 2] & 65535);
            c = (p & 65535);
            d = ((p|0) >>> 16);
            d = ((((d << 1) + (((c|0) >> 15) & 1)))|0);
            c <<= 1;
            p = (A[astart + 1] & 65535) * (A[astart + 1] & 65535);
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            e = e + (c & 65535);
            c = (e & 65535);
            e = d + ((e|0) >>> 16);
            R[rstart + 2] = (c & 65535);
            p = (A[astart] & 65535) * (A[astart + 3] & 65535);
            c = (p & 65535);
            d = ((p|0) >>> 16);
            p = (A[astart + 1] & 65535) * (A[astart + 2] & 65535);
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            d = ((((d << 1) + (((c|0) >> 15) & 1)))|0);
            c <<= 1;
            e = e + (c & 65535);
            c = (e & 65535);
            e = d + ((e|0) >>> 16);
            R[rstart + 3] = (c & 65535);
            p = (A[astart + 1] & 65535) * (A[astart + 3] & 65535);
            c = (p & 65535);
            d = ((p|0) >>> 16);
            d = ((((d << 1) + (((c|0) >> 15) & 1)))|0);
            c <<= 1;
            p = (A[astart + 2] & 65535) * (A[astart + 2] & 65535);
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            e = e + (c & 65535);
            c = (e & 65535);
            e = d + ((e|0) >>> 16);
            R[rstart + 4] = (c & 65535);
            p = (A[astart + 2] & 65535) * (A[astart + 3] & 65535);
            c = (p & 65535);
            d = ((p|0) >>> 16);
            d = ((((d << 1) + (((c|0) >> 15) & 1)))|0);
            c <<= 1;
            e = e + (c & 65535);
            c = (e & 65535);
            e = d + ((e|0) >>> 16);
            R[rstart + 2 * 4 - 3] = (c & 65535);
            p = (A[astart + 4 - 1] & 65535) * (A[astart + 4 - 1] & 65535);
            p = p + (e);
            R[rstart + 2 * 4 - 2] = ((p & 65535) & 65535);
            R[rstart + 2 * 4 - 1] = ((p >> 16) & 65535);
        }
    };
    constructor['Baseline_Square8'] = constructor.Baseline_Square8 = function(R, rstart, A, astart) {
        {
            var p;
            var c;
            var d;
            var e;
            p = (A[astart] & 65535) * (A[astart] & 65535);
            R[rstart] = ((p & 65535) & 65535);
            e = ((p|0) >>> 16);
            p = (A[astart] & 65535) * (A[astart + 1] & 65535);
            c = (p & 65535);
            d = ((p|0) >>> 16);
            d = ((((d << 1) + (((c|0) >> 15) & 1)))|0);
            c <<= 1;
            e = e + (c & 65535);
            c = (e & 65535);
            e = d + ((e|0) >>> 16);
            R[rstart + 1] = (c & 65535);
            p = (A[astart] & 65535) * (A[astart + 2] & 65535);
            c = (p & 65535);
            d = ((p|0) >>> 16);
            d = ((((d << 1) + (((c|0) >> 15) & 1)))|0);
            c <<= 1;
            p = (A[astart + 1] & 65535) * (A[astart + 1] & 65535);
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            e = e + (c & 65535);
            c = (e & 65535);
            e = d + ((e|0) >>> 16);
            R[rstart + 2] = (c & 65535);
            p = (A[astart] & 65535) * (A[astart + 3] & 65535);
            c = (p & 65535);
            d = ((p|0) >>> 16);
            p = (A[astart + 1] & 65535) * (A[astart + 2] & 65535);
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            d = ((((d << 1) + (((c|0) >> 15) & 1)))|0);
            c <<= 1;
            e = e + (c & 65535);
            c = (e & 65535);
            e = d + ((e|0) >>> 16);
            R[rstart + 3] = (c & 65535);
            p = (A[astart] & 65535) * (A[astart + 4] & 65535);
            c = (p & 65535);
            d = ((p|0) >>> 16);
            p = (A[astart + 1] & 65535) * (A[astart + 3] & 65535);
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            d = ((((d << 1) + (((c|0) >> 15) & 1)))|0);
            c <<= 1;
            p = (A[astart + 2] & 65535) * (A[astart + 2] & 65535);
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            e = e + (c & 65535);
            c = (e & 65535);
            e = d + ((e|0) >>> 16);
            R[rstart + 4] = (c & 65535);
            p = (A[astart] & 65535) * (A[astart + 5] & 65535);
            c = (p & 65535);
            d = ((p|0) >>> 16);
            p = (A[astart + 1] & 65535) * (A[astart + 4] & 65535);
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            p = (A[astart + 2] & 65535) * (A[astart + 3] & 65535);
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            d = ((((d << 1) + (((c|0) >> 15) & 1)))|0);
            c <<= 1;
            e = e + (c & 65535);
            c = (e & 65535);
            e = d + ((e|0) >>> 16);
            R[rstart + 5] = (c & 65535);
            p = (A[astart] & 65535) * (A[astart + 6] & 65535);
            c = (p & 65535);
            d = ((p|0) >>> 16);
            p = (A[astart + 1] & 65535) * (A[astart + 5] & 65535);
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            p = (A[astart + 2] & 65535) * (A[astart + 4] & 65535);
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            d = ((((d << 1) + (((c|0) >> 15) & 1)))|0);
            c <<= 1;
            p = (A[astart + 3] & 65535) * (A[astart + 3] & 65535);
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            e = e + (c & 65535);
            c = (e & 65535);
            e = d + ((e|0) >>> 16);
            R[rstart + 6] = (c & 65535);
            p = (A[astart] & 65535) * (A[astart + 7] & 65535);
            c = (p & 65535);
            d = ((p|0) >>> 16);
            p = (A[astart + 1] & 65535) * (A[astart + 6] & 65535);
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            p = (A[astart + 2] & 65535) * (A[astart + 5] & 65535);
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            p = (A[astart + 3] & 65535) * (A[astart + 4] & 65535);
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            d = ((((d << 1) + (((c|0) >> 15) & 1)))|0);
            c <<= 1;
            e = e + (c & 65535);
            c = (e & 65535);
            e = d + ((e|0) >>> 16);
            R[rstart + 7] = (c & 65535);
            p = (A[astart + 1] & 65535) * (A[astart + 7] & 65535);
            c = (p & 65535);
            d = ((p|0) >>> 16);
            p = (A[astart + 2] & 65535) * (A[astart + 6] & 65535);
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            p = (A[astart + 3] & 65535) * (A[astart + 5] & 65535);
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            d = ((((d << 1) + (((c|0) >> 15) & 1)))|0);
            c <<= 1;
            p = (A[astart + 4] & 65535) * (A[astart + 4] & 65535);
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            e = e + (c & 65535);
            c = (e & 65535);
            e = d + ((e|0) >>> 16);
            R[rstart + 8] = (c & 65535);
            p = (A[astart + 2] & 65535) * (A[astart + 7] & 65535);
            c = (p & 65535);
            d = ((p|0) >>> 16);
            p = (A[astart + 3] & 65535) * (A[astart + 6] & 65535);
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            p = (A[astart + 4] & 65535) * (A[astart + 5] & 65535);
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            d = ((((d << 1) + (((c|0) >> 15) & 1)))|0);
            c <<= 1;
            e = e + (c & 65535);
            c = (e & 65535);
            e = d + ((e|0) >>> 16);
            R[rstart + 9] = (c & 65535);
            p = (A[astart + 3] & 65535) * (A[astart + 7] & 65535);
            c = (p & 65535);
            d = ((p|0) >>> 16);
            p = (A[astart + 4] & 65535) * (A[astart + 6] & 65535);
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            d = ((((d << 1) + (((c|0) >> 15) & 1)))|0);
            c <<= 1;
            p = (A[astart + 5] & 65535) * (A[astart + 5] & 65535);
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            e = e + (c & 65535);
            c = (e & 65535);
            e = d + ((e|0) >>> 16);
            R[rstart + 10] = (c & 65535);
            p = (A[astart + 4] & 65535) * (A[astart + 7] & 65535);
            c = (p & 65535);
            d = ((p|0) >>> 16);
            p = (A[astart + 5] & 65535) * (A[astart + 6] & 65535);
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            d = ((((d << 1) + (((c|0) >> 15) & 1)))|0);
            c <<= 1;
            e = e + (c & 65535);
            c = (e & 65535);
            e = d + ((e|0) >>> 16);
            R[rstart + 11] = (c & 65535);
            p = (A[astart + 5] & 65535) * (A[astart + 7] & 65535);
            c = (p & 65535);
            d = ((p|0) >>> 16);
            d = ((((d << 1) + (((c|0) >> 15) & 1)))|0);
            c <<= 1;
            p = (A[astart + 6] & 65535) * (A[astart + 6] & 65535);
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            e = e + (c & 65535);
            c = (e & 65535);
            e = d + ((e|0) >>> 16);
            R[rstart + 12] = (c & 65535);
            p = (A[astart + 6] & 65535) * (A[astart + 7] & 65535);
            c = (p & 65535);
            d = ((p|0) >>> 16);
            d = ((((d << 1) + (((c|0) >> 15) & 1)))|0);
            c <<= 1;
            e = e + (c & 65535);
            c = (e & 65535);
            e = d + ((e|0) >>> 16);
            R[rstart + 2 * 8 - 3] = (c & 65535);
            p = (A[astart + 8 - 1] & 65535) * (A[astart + 8 - 1] & 65535);
            p = p + (e);
            R[rstart + 2 * 8 - 2] = ((p & 65535) & 65535);
            R[rstart + 2 * 8 - 1] = ((p >> 16) & 65535);
        }
    };
    constructor['Baseline_Multiply2'] = constructor.Baseline_Multiply2 = function(R, rstart, A, astart, B, bstart) {
        {
            var p;
            var c;
            var d;
            var a0 = (A[astart] & 65535);
            var a1 = (A[astart + 1] & 65535);
            var b0 = (B[bstart] & 65535);
            var b1 = (B[bstart + 1] & 65535);
            p = a0 * b0;
            c = (p & 65535);
            d = ((p|0) >>> 16);
            R[rstart] = (c & 65535);
            c = (d & 65535);
            d = ((d|0) >>> 16);
            p = a0 * b1;
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            p = a1 * b0;
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            R[rstart + 1] = (c & 65535);
            p = a1 * b1;
            p = p + (d);
            R[rstart + 1 + 1] = ((p & 65535) & 65535);
            R[rstart + 1 + 2] = ((p >> 16) & 65535);
        }
    };
    constructor['Baseline_Multiply4'] = constructor.Baseline_Multiply4 = function(R, rstart, A, astart, B, bstart) {
        var mask = 65535;
        {
            var p;
            var c;
            var d;
            var a0 = (((A[astart])|0) & mask);
            var b0 = (((B[bstart])|0) & mask);
            p = a0 * b0;
            c = (p & 65535);
            d = (((p|0) >> 16) & mask);
            R[rstart] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = a0 * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * b0;
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 1] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = a0 * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * b0;
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 2] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = a0 * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * b0;
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 3] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 4] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 5] = (c & 65535);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + (d);
            R[rstart + 5 + 1] = ((p & 65535) & 65535);
            R[rstart + 5 + 2] = ((p >> 16) & 65535);
        }
    };
    constructor['Baseline_Multiply8'] = constructor.Baseline_Multiply8 = function(R, rstart, A, astart, B, bstart) {
        var mask = 65535;
        {
            var p;
            var c;
            var d;
            p = (((A[astart])|0) & mask) * (((B[bstart])|0) & mask);
            c = (p & 65535);
            d = (((p|0) >> 16) & mask);
            R[rstart] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 1] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 2] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 3] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart])|0) & mask) * (((B[bstart + 4])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 4])|0) & mask) * (((B[bstart])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 4] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart])|0) & mask) * (((B[bstart + 5])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart + 4])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 4])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 5])|0) & mask) * (((B[bstart])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 5] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart])|0) & mask) * (((B[bstart + 6])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart + 5])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart + 4])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 4])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 5])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 6])|0) & mask) * (((B[bstart])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 6] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart])|0) & mask) * (((B[bstart + 7])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart + 6])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart + 5])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart + 4])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 4])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 5])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 6])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 7])|0) & mask) * (((B[bstart])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 7] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart + 7])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart + 6])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart + 5])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 4])|0) & mask) * (((B[bstart + 4])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 5])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 6])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 7])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 8] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart + 7])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart + 6])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 4])|0) & mask) * (((B[bstart + 5])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 5])|0) & mask) * (((B[bstart + 4])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 6])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 7])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 9] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart + 7])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 4])|0) & mask) * (((B[bstart + 6])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 5])|0) & mask) * (((B[bstart + 5])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 6])|0) & mask) * (((B[bstart + 4])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 7])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 10] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart + 4])|0) & mask) * (((B[bstart + 7])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 5])|0) & mask) * (((B[bstart + 6])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 6])|0) & mask) * (((B[bstart + 5])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 7])|0) & mask) * (((B[bstart + 4])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 11] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart + 5])|0) & mask) * (((B[bstart + 7])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 6])|0) & mask) * (((B[bstart + 6])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 7])|0) & mask) * (((B[bstart + 5])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 12] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart + 6])|0) & mask) * (((B[bstart + 7])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 7])|0) & mask) * (((B[bstart + 6])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 13] = (c & 65535);
            p = (((A[astart + 7])|0) & mask) * (((B[bstart + 7])|0) & mask);
            p = p + (d);
            R[rstart + 13 + 1] = ((p & 65535) & 65535);
            R[rstart + 13 + 2] = ((p >> 16) & 65535);
        }
    };
    constructor['Baseline_Multiply16'] = constructor.Baseline_Multiply16 = function(R, rstart, A, astart, B, bstart) {
        var mask = 65535;
        {
            var p;
            var c;
            var d;
            p = (((A[astart])|0) & mask) * (((B[bstart])|0) & mask);
            c = (p & 65535);
            d = (((p|0) >> 16) & mask);
            R[rstart] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 1] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 2] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 3] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart])|0) & mask) * (((B[bstart + 4])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 4])|0) & mask) * (((B[bstart])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 4] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart])|0) & mask) * (((B[bstart + 5])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart + 4])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 4])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 5])|0) & mask) * (((B[bstart])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 5] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart])|0) & mask) * (((B[bstart + 6])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart + 5])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart + 4])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 4])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 5])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 6])|0) & mask) * (((B[bstart])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 6] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart])|0) & mask) * (((B[bstart + 7])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart + 6])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart + 5])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart + 4])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 4])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 5])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 6])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 7])|0) & mask) * (((B[bstart])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 7] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart])|0) & mask) * (((B[bstart + 8])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart + 7])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart + 6])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart + 5])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 4])|0) & mask) * (((B[bstart + 4])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 5])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 6])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 7])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 8])|0) & mask) * (((B[bstart])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 8] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart])|0) & mask) * (((B[bstart + 9])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart + 8])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart + 7])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart + 6])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 4])|0) & mask) * (((B[bstart + 5])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 5])|0) & mask) * (((B[bstart + 4])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 6])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 7])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 8])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 9])|0) & mask) * (((B[bstart])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 9] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart])|0) & mask) * (((B[bstart + 10])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart + 9])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart + 8])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart + 7])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 4])|0) & mask) * (((B[bstart + 6])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 5])|0) & mask) * (((B[bstart + 5])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 6])|0) & mask) * (((B[bstart + 4])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 7])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 8])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 9])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 10])|0) & mask) * (((B[bstart])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 10] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart])|0) & mask) * (((B[bstart + 11])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart + 10])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart + 9])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart + 8])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 4])|0) & mask) * (((B[bstart + 7])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 5])|0) & mask) * (((B[bstart + 6])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 6])|0) & mask) * (((B[bstart + 5])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 7])|0) & mask) * (((B[bstart + 4])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 8])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 9])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 10])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 11])|0) & mask) * (((B[bstart])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 11] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart])|0) & mask) * (((B[bstart + 12])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart + 11])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart + 10])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart + 9])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 4])|0) & mask) * (((B[bstart + 8])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 5])|0) & mask) * (((B[bstart + 7])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 6])|0) & mask) * (((B[bstart + 6])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 7])|0) & mask) * (((B[bstart + 5])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 8])|0) & mask) * (((B[bstart + 4])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 9])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 10])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 11])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 12])|0) & mask) * (((B[bstart])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 12] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart])|0) & mask) * (((B[bstart + 13])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart + 12])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart + 11])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart + 10])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 4])|0) & mask) * (((B[bstart + 9])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 5])|0) & mask) * (((B[bstart + 8])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 6])|0) & mask) * (((B[bstart + 7])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 7])|0) & mask) * (((B[bstart + 6])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 8])|0) & mask) * (((B[bstart + 5])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 9])|0) & mask) * (((B[bstart + 4])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 10])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 11])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 12])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 13])|0) & mask) * (((B[bstart])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 13] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart])|0) & mask) * (((B[bstart + 14])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart + 13])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart + 12])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart + 11])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 4])|0) & mask) * (((B[bstart + 10])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 5])|0) & mask) * (((B[bstart + 9])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 6])|0) & mask) * (((B[bstart + 8])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 7])|0) & mask) * (((B[bstart + 7])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 8])|0) & mask) * (((B[bstart + 6])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 9])|0) & mask) * (((B[bstart + 5])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 10])|0) & mask) * (((B[bstart + 4])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 11])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 12])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 13])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 14])|0) & mask) * (((B[bstart])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 14] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart])|0) & mask) * (((B[bstart + 15])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart + 14])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart + 13])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart + 12])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 4])|0) & mask) * (((B[bstart + 11])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 5])|0) & mask) * (((B[bstart + 10])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 6])|0) & mask) * (((B[bstart + 9])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 7])|0) & mask) * (((B[bstart + 8])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 8])|0) & mask) * (((B[bstart + 7])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 9])|0) & mask) * (((B[bstart + 6])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 10])|0) & mask) * (((B[bstart + 5])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 11])|0) & mask) * (((B[bstart + 4])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 12])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 13])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 14])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 15])|0) & mask) * (((B[bstart])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 15] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart + 1])|0) & mask) * (((B[bstart + 15])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart + 14])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart + 13])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 4])|0) & mask) * (((B[bstart + 12])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 5])|0) & mask) * (((B[bstart + 11])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 6])|0) & mask) * (((B[bstart + 10])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 7])|0) & mask) * (((B[bstart + 9])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 8])|0) & mask) * (((B[bstart + 8])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 9])|0) & mask) * (((B[bstart + 7])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 10])|0) & mask) * (((B[bstart + 6])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 11])|0) & mask) * (((B[bstart + 5])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 12])|0) & mask) * (((B[bstart + 4])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 13])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 14])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 15])|0) & mask) * (((B[bstart + 1])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 16] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart + 2])|0) & mask) * (((B[bstart + 15])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart + 14])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 4])|0) & mask) * (((B[bstart + 13])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 5])|0) & mask) * (((B[bstart + 12])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 6])|0) & mask) * (((B[bstart + 11])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 7])|0) & mask) * (((B[bstart + 10])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 8])|0) & mask) * (((B[bstart + 9])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 9])|0) & mask) * (((B[bstart + 8])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 10])|0) & mask) * (((B[bstart + 7])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 11])|0) & mask) * (((B[bstart + 6])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 12])|0) & mask) * (((B[bstart + 5])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 13])|0) & mask) * (((B[bstart + 4])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 14])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 15])|0) & mask) * (((B[bstart + 2])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 17] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart + 3])|0) & mask) * (((B[bstart + 15])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 4])|0) & mask) * (((B[bstart + 14])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 5])|0) & mask) * (((B[bstart + 13])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 6])|0) & mask) * (((B[bstart + 12])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 7])|0) & mask) * (((B[bstart + 11])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 8])|0) & mask) * (((B[bstart + 10])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 9])|0) & mask) * (((B[bstart + 9])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 10])|0) & mask) * (((B[bstart + 8])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 11])|0) & mask) * (((B[bstart + 7])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 12])|0) & mask) * (((B[bstart + 6])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 13])|0) & mask) * (((B[bstart + 5])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 14])|0) & mask) * (((B[bstart + 4])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 15])|0) & mask) * (((B[bstart + 3])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 18] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart + 4])|0) & mask) * (((B[bstart + 15])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 5])|0) & mask) * (((B[bstart + 14])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 6])|0) & mask) * (((B[bstart + 13])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 7])|0) & mask) * (((B[bstart + 12])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 8])|0) & mask) * (((B[bstart + 11])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 9])|0) & mask) * (((B[bstart + 10])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 10])|0) & mask) * (((B[bstart + 9])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 11])|0) & mask) * (((B[bstart + 8])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 12])|0) & mask) * (((B[bstart + 7])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 13])|0) & mask) * (((B[bstart + 6])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 14])|0) & mask) * (((B[bstart + 5])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 15])|0) & mask) * (((B[bstart + 4])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 19] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart + 5])|0) & mask) * (((B[bstart + 15])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 6])|0) & mask) * (((B[bstart + 14])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 7])|0) & mask) * (((B[bstart + 13])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 8])|0) & mask) * (((B[bstart + 12])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 9])|0) & mask) * (((B[bstart + 11])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 10])|0) & mask) * (((B[bstart + 10])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 11])|0) & mask) * (((B[bstart + 9])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 12])|0) & mask) * (((B[bstart + 8])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 13])|0) & mask) * (((B[bstart + 7])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 14])|0) & mask) * (((B[bstart + 6])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 15])|0) & mask) * (((B[bstart + 5])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 20] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart + 6])|0) & mask) * (((B[bstart + 15])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 7])|0) & mask) * (((B[bstart + 14])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 8])|0) & mask) * (((B[bstart + 13])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 9])|0) & mask) * (((B[bstart + 12])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 10])|0) & mask) * (((B[bstart + 11])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 11])|0) & mask) * (((B[bstart + 10])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 12])|0) & mask) * (((B[bstart + 9])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 13])|0) & mask) * (((B[bstart + 8])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 14])|0) & mask) * (((B[bstart + 7])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 15])|0) & mask) * (((B[bstart + 6])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 21] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart + 7])|0) & mask) * (((B[bstart + 15])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 8])|0) & mask) * (((B[bstart + 14])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 9])|0) & mask) * (((B[bstart + 13])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 10])|0) & mask) * (((B[bstart + 12])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 11])|0) & mask) * (((B[bstart + 11])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 12])|0) & mask) * (((B[bstart + 10])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 13])|0) & mask) * (((B[bstart + 9])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 14])|0) & mask) * (((B[bstart + 8])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 15])|0) & mask) * (((B[bstart + 7])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 22] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart + 8])|0) & mask) * (((B[bstart + 15])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 9])|0) & mask) * (((B[bstart + 14])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 10])|0) & mask) * (((B[bstart + 13])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 11])|0) & mask) * (((B[bstart + 12])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 12])|0) & mask) * (((B[bstart + 11])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 13])|0) & mask) * (((B[bstart + 10])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 14])|0) & mask) * (((B[bstart + 9])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 15])|0) & mask) * (((B[bstart + 8])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 23] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart + 9])|0) & mask) * (((B[bstart + 15])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 10])|0) & mask) * (((B[bstart + 14])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 11])|0) & mask) * (((B[bstart + 13])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 12])|0) & mask) * (((B[bstart + 12])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 13])|0) & mask) * (((B[bstart + 11])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 14])|0) & mask) * (((B[bstart + 10])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 15])|0) & mask) * (((B[bstart + 9])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 24] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart + 10])|0) & mask) * (((B[bstart + 15])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 11])|0) & mask) * (((B[bstart + 14])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 12])|0) & mask) * (((B[bstart + 13])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 13])|0) & mask) * (((B[bstart + 12])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 14])|0) & mask) * (((B[bstart + 11])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 15])|0) & mask) * (((B[bstart + 10])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 25] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart + 11])|0) & mask) * (((B[bstart + 15])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 12])|0) & mask) * (((B[bstart + 14])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 13])|0) & mask) * (((B[bstart + 13])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 14])|0) & mask) * (((B[bstart + 12])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 15])|0) & mask) * (((B[bstart + 11])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 26] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart + 12])|0) & mask) * (((B[bstart + 15])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 13])|0) & mask) * (((B[bstart + 14])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 14])|0) & mask) * (((B[bstart + 13])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 15])|0) & mask) * (((B[bstart + 12])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 27] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart + 13])|0) & mask) * (((B[bstart + 15])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 14])|0) & mask) * (((B[bstart + 14])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 15])|0) & mask) * (((B[bstart + 13])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 28] = (c & 65535);
            c = (d & 65535);
            d = (((d|0) >> 16) & mask);
            p = (((A[astart + 14])|0) & mask) * (((B[bstart + 15])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            p = (((A[astart + 15])|0) & mask) * (((B[bstart + 14])|0) & mask);
            p = p + ((c|0) & mask);
            c = (p & 65535);
            d = d + (((p|0) >> 16) & mask);
            R[rstart + 29] = (c & 65535);
            p = (((A[astart + 15])|0) & mask) * (((B[bstart + 15])|0) & mask);
            p = p + (d);
            R[rstart + 30] = ((p & 65535) & 65535);
            R[rstart + 31] = ((p >> 16) & 65535);
        }
    };
    constructor['s_recursionLimit'] = constructor.s_recursionLimit = 8;
    constructor['RecursiveMultiply'] = constructor.RecursiveMultiply = function(Rarr, Rstart, Tarr, Tstart, Aarr, Astart, Barr, Bstart, N) {
        var sn = N;
        if (N <= BigInteger.s_recursionLimit) {
            N >>= 2;
            if (N == 0) {
                BigInteger.Baseline_Multiply2(Rarr, Rstart, Aarr, Astart, Barr, Bstart);
            } else if (N == 1) {
                BigInteger.Baseline_Multiply4(Rarr, Rstart, Aarr, Astart, Barr, Bstart);
            } else if (N == 2) {
                BigInteger.Baseline_Multiply8(Rarr, Rstart, Aarr, Astart, Barr, Bstart);
            } else {
                throw new Error();
            }
        } else {
            var N2 = N >> 1;
            var rMediumHigh = Rstart + N;
            var rHigh = rMediumHigh + N2;
            var rMediumLow = Rstart + N2;
            var tsn = Tstart + N;
            var AN = N;
            while (AN != 0 && Aarr[Astart + AN - 1] == 0) AN--;
            var BN = N;
            while (BN != 0 && Barr[Bstart + BN - 1] == 0) BN--;
            var AN2 = 0;
            var BN2 = 0;
            if (AN == 0 || BN == 0) {
                for (var arrfillI = Rstart; arrfillI < (Rstart) + (N << 1); arrfillI++) Rarr[arrfillI] = 0;
                return;
            }
            if (AN <= N2 && BN <= N2) {
                for (var arrfillI = Rstart + N; arrfillI < (Rstart + N) + (N); arrfillI++) Rarr[arrfillI] = 0;
                if (N2 == 8) BigInteger.Baseline_Multiply8(Rarr, Rstart, Aarr, Astart, Barr, Bstart); else BigInteger.RecursiveMultiply(Rarr, Rstart, Tarr, Tstart, Aarr, Astart, Barr, Bstart, N2);
                return;
            }
            AN2 = BigInteger.Compare(Aarr, Astart, Aarr, ((Astart + N2)|0), N2) > 0 ? 0 : N2;
            BigInteger.Subtract(Rarr, Rstart, Aarr, ((Astart + AN2)|0), Aarr, ((Astart + (N2 ^ AN2))|0), N2);
            BN2 = BigInteger.Compare(Barr, Bstart, Barr, ((Bstart + N2)|0), N2) > 0 ? 0 : N2;
            BigInteger.Subtract(Rarr, rMediumLow, Barr, ((Bstart + BN2)|0), Barr, ((Bstart + (N2 ^ BN2))|0), N2);
            BigInteger.RecursiveMultiply(Rarr, rMediumHigh, Tarr, tsn, Aarr, ((Astart + N2)|0), Barr, ((Bstart + N2)|0), N2);
            BigInteger.RecursiveMultiply(Tarr, Tstart, Tarr, tsn, Rarr, Rstart, Rarr, (rMediumLow|0), N2);
            BigInteger.RecursiveMultiply(Rarr, Rstart, Tarr, tsn, Aarr, Astart, Barr, Bstart, N2);
            var c2 = BigInteger.Add(Rarr, rMediumHigh, Rarr, rMediumHigh, Rarr, rMediumLow, N2);
            var c3 = c2;
            c2 = c2 + (BigInteger.Add(Rarr, rMediumLow, Rarr, rMediumHigh, Rarr, (Rstart), N2));
            c3 = c3 + (BigInteger.Add(Rarr, rMediumHigh, Rarr, rMediumHigh, Rarr, rHigh, N2));
            if (AN2 == BN2) c3 -= BigInteger.Subtract(Rarr, rMediumLow, Rarr, rMediumLow, Tarr, Tstart, N); else c3 = c3 + (BigInteger.Add(Rarr, rMediumLow, Rarr, rMediumLow, Tarr, Tstart, N));
            c3 = c3 + (BigInteger.Increment(Rarr, rMediumHigh, N2, (c2|0)));
            if (c3 != 0) BigInteger.Increment(Rarr, rHigh, N2, (c3|0));
        }
    };
    constructor['RecursiveSquare'] = constructor.RecursiveSquare = function(Rarr, Rstart, Tarr, Tstart, Aarr, Astart, N) {
        if (N <= BigInteger.s_recursionLimit) {
            N >>= 2;
            switch(N) {
                case 0:
                    BigInteger.Baseline_Square2(Rarr, Rstart, Aarr, Astart);
                    break;
                case 1:
                    BigInteger.Baseline_Square4(Rarr, Rstart, Aarr, Astart);
                    break;
                case 2:
                    BigInteger.Baseline_Square8(Rarr, Rstart, Aarr, Astart);
                    break;
                default:
                    throw new Error();
            }
        } else {
            var N2 = N >> 1;
            BigInteger.RecursiveSquare(Rarr, Rstart, Tarr, ((Tstart + N)|0), Aarr, Astart, N2);
            BigInteger.RecursiveSquare(Rarr, ((Rstart + N)|0), Tarr, ((Tstart + N)|0), Aarr, ((Astart + N2)|0), N2);
            BigInteger.RecursiveMultiply(Tarr, Tstart, Tarr, ((Tstart + N)|0), Aarr, Astart, Aarr, ((Astart + N2)|0), N2);
            var carry = BigInteger.Add(Rarr, ((Rstart + N2)|0), Rarr, ((Rstart + N2)|0), Tarr, Tstart, N);
            carry = carry + (BigInteger.Add(Rarr, ((Rstart + N2)|0), Rarr, ((Rstart + N2)|0), Tarr, Tstart, N));
            BigInteger.Increment(Rarr, ((Rstart + N + N2)|0), N2, (carry|0));
        }
    };
    constructor['AsymmetricMultiply'] = constructor.AsymmetricMultiply = function(Rarr, Rstart, Tarr, Tstart, Aarr, Astart, NA, Barr, Bstart, NB) {
        if (NA == NB) {
            if (Astart == Bstart && Aarr == Barr) {
                BigInteger.RecursiveSquare(Rarr, Rstart, Tarr, Tstart, Aarr, Astart, NA);
            } else if (NA == 2) BigInteger.Baseline_Multiply2(Rarr, Rstart, Aarr, Astart, Barr, Bstart); else BigInteger.RecursiveMultiply(Rarr, Rstart, Tarr, Tstart, Aarr, Astart, Barr, Bstart, NA);
            return;
        }
        if (NA > NB) {
            var tmp1 = Aarr;
            Aarr = Barr;
            Barr = tmp1;
            var tmp3 = Astart;
            Astart = Bstart;
            Bstart = tmp3;
            var tmp2 = NA;
            NA = NB;
            NB = tmp2;
        }
        if (NA == 2 && Aarr[Astart + 1] == 0) {
            switch(Aarr[Astart]) {
                case 0:
                    for (var arrfillI = Rstart; arrfillI < (Rstart) + (NB + 2); arrfillI++) Rarr[arrfillI] = 0;
                    return;
                case 1:
                    for (var arrfillI = 0; arrfillI < (NB|0); arrfillI++) Rarr[Rstart + arrfillI] = Barr[Bstart + arrfillI];
                    Rarr[Rstart + NB] = 0;
                    Rarr[Rstart + NB + 1] = 0;
                    return;
                default:
                    Rarr[Rstart + NB] = ((BigInteger.LinearMultiply(Rarr, Rstart, Barr, Bstart, Aarr[Astart], NB)) & 65535);
                    Rarr[Rstart + NB + 1] = 0;
                    return;
            }
        } else if (NA == 2) {
            var a0 = (Aarr[Astart] & 65535);
            var a1 = (Aarr[Astart + 1] & 65535);
            Rarr[Rstart + NB] = 0;
            Rarr[Rstart + NB + 1] = 0;
            BigInteger.AtomicMultiplyOpt(Rarr, Rstart, a0, a1, Barr, Bstart, 0, NB);
            BigInteger.AtomicMultiplyAddOpt(Rarr, Rstart, a0, a1, Barr, Bstart, 2, NB);
            return;
        } else {
            var i;
            if (((NB / NA) & 1) == 0) {
                BigInteger.RecursiveMultiply(Rarr, Rstart, Tarr, Tstart, Aarr, Astart, Barr, Bstart, NA);
                for (var arrfillI = 0; arrfillI < (NA|0); arrfillI++) Tarr[((Tstart + (NA << 1))|0) + arrfillI] = Rarr[((Rstart + NA)|0) + arrfillI];
                for (i = (NA << 1); i < NB; i += (NA << 1)) BigInteger.RecursiveMultiply(Tarr, ((Tstart + NA + i)|0), Tarr, Tstart, Aarr, Astart, Barr, ((Bstart + i)|0), NA);
                for (i = NA; i < NB; i += (NA << 1)) BigInteger.RecursiveMultiply(Rarr, ((Rstart + i)|0), Tarr, Tstart, Aarr, Astart, Barr, ((Bstart + i)|0), NA);
            } else {
                for (i = 0; i < NB; i += (NA << 1)) BigInteger.RecursiveMultiply(Rarr, ((Rstart + i)|0), Tarr, Tstart, Aarr, Astart, Barr, ((Bstart + i)|0), NA);
                for (i = NA; i < NB; i += (NA << 1)) BigInteger.RecursiveMultiply(Tarr, ((Tstart + NA + i)|0), Tarr, Tstart, Aarr, Astart, Barr, ((Bstart + i)|0), NA);
            }
            if (BigInteger.Add(Rarr, ((Rstart + NA)|0), Rarr, ((Rstart + NA)|0), Tarr, ((Tstart + (NA << 1))|0), NB - NA) != 0) BigInteger.Increment(Rarr, ((Rstart + NB)|0), NA, 1);
        }
    };
    constructor['MakeUint'] = constructor.MakeUint = function(first, second) {
        return ((((first & 65535) | ((second|0) << 16))|0));
    };
    constructor['GetLowHalf'] = constructor.GetLowHalf = function(val) {
        return (val & 65535);
    };
    constructor['GetHighHalf'] = constructor.GetHighHalf = function(val) {
        return ((val >>> 16)|0);
    };
    constructor['GetHighHalfAsBorrow'] = constructor.GetHighHalfAsBorrow = function(val) {
        return ((0 - (val >>> 16))|0);
    };
    constructor['BitPrecision'] = constructor.BitPrecision = function(numberValue) {
        if (numberValue == 0) return 0;
        var i = 16;
        {
            if ((numberValue >> 8) == 0) {
                numberValue <<= 8;
                i -= 8;
            }
            if ((numberValue >> 12) == 0) {
                numberValue <<= 4;
                i -= 4;
            }
            if ((numberValue >> 14) == 0) {
                numberValue <<= 2;
                i -= 2;
            }
            if ((numberValue >> 15) == 0) --i;
        }
        return i;
    };
    constructor['BitPrecisionInt'] = constructor.BitPrecisionInt = function(numberValue) {
        if (numberValue == 0) return 0;
        var i = 32;
        {
            if ((numberValue >> 16) == 0) {
                numberValue <<= 16;
                i -= 16;
            }
            if ((numberValue >> 24) == 0) {
                numberValue <<= 8;
                i -= 8;
            }
            if ((numberValue >> 28) == 0) {
                numberValue <<= 4;
                i -= 4;
            }
            if ((numberValue >> 30) == 0) {
                numberValue <<= 2;
                i -= 2;
            }
            if ((numberValue >> 31) == 0) --i;
        }
        return i;
    };
    constructor['Divide32By16'] = constructor.Divide32By16 = function(dividendLow, divisorShort, returnRemainder) {
        var tmpInt;
        var dividendHigh = 0;
        var intDivisor = (divisorShort & 65535);
        for (var i = 0; i < 32; i++) {
            tmpInt = dividendHigh >> 31;
            dividendHigh <<= 1;
            dividendHigh = (((dividendHigh | ((dividendLow >> 31) & 1))|0));
            dividendLow <<= 1;
            tmpInt |= dividendHigh;
            if (((tmpInt >> 31) != 0) || (tmpInt >= intDivisor)) {
                {
                    dividendHigh -= intDivisor;
                    dividendLow = dividendLow + (1);
                }
            }
        }
        return (returnRemainder ? (dividendHigh & 65535) : (dividendLow & 65535));
    };
    constructor['DivideUnsigned'] = constructor.DivideUnsigned = function(x, y) {
        {
            var iy = (y & 65535);
            if ((x >> 31) == 0) {
                return (((x|0) / iy) & 65535);
            } else {
                return BigInteger.Divide32By16(x, y, false);
            }
        }
    };
    constructor['RemainderUnsigned'] = constructor.RemainderUnsigned = function(x, y) {
        {
            var iy = (y & 65535);
            if ((x >> 31) == 0) {
                return (((x|0) % iy) & 65535);
            } else {
                return BigInteger.Divide32By16(x, y, true);
            }
        }
    };
    constructor['DivideThreeWordsByTwo'] = constructor.DivideThreeWordsByTwo = function(A, Astart, B0, B1) {
        var Q;
        {
            if (((B1 + 1)|0) == 0) Q = A[Astart + 2]; else if (B1 != 0) Q = BigInteger.DivideUnsigned(BigInteger.MakeUint(A[Astart + 1], A[Astart + 2]), (((B1|0) + 1) & 65535)); else Q = BigInteger.DivideUnsigned(BigInteger.MakeUint(A[Astart], A[Astart + 1]), B0);
            var Qint = (Q & 65535);
            var B0int = (B0 & 65535);
            var B1int = (B1 & 65535);
            var p = B0int * Qint;
            var u = (A[Astart] & 65535) - (p & 65535);
            A[Astart] = ((BigInteger.GetLowHalf(u)) & 65535);
            u = (A[Astart + 1] & 65535) - (p >>> 16) - ((BigInteger.GetHighHalfAsBorrow(u)) & 65535) - (B1int * Qint);
            A[Astart + 1] = ((BigInteger.GetLowHalf(u)) & 65535);
            A[Astart + 2] = ((A[Astart + 2] + BigInteger.GetHighHalf(u)) & 65535);
            while (A[Astart + 2] != 0 || (A[Astart + 1] & 65535) > (B1 & 65535) || (A[Astart + 1] == B1 && (A[Astart] & 65535) >= (B0 & 65535))) {
                u = (A[Astart] & 65535) - B0int;
                A[Astart] = ((BigInteger.GetLowHalf(u)) & 65535);
                u = (A[Astart + 1] & 65535) - B1int - ((BigInteger.GetHighHalfAsBorrow(u)) & 65535);
                A[Astart + 1] = ((BigInteger.GetLowHalf(u)) & 65535);
                A[Astart + 2] = ((A[Astart + 2] + BigInteger.GetHighHalf(u)) & 65535);
                Q++;
            }
        }
        return Q;
    };
    constructor['AtomicDivide'] = constructor.AtomicDivide = function(Q, Qstart, A, Astart, B0, B1, T) {
        if (B0 == 0 && B1 == 0) {
            Q[Qstart] = (A[Astart] & 65535);
            Q[Qstart + 1] = (A[Astart + 3] & 65535);
        } else {
            T[0] = (A[Astart] & 65535);
            T[1] = (A[Astart + 1] & 65535);
            T[2] = (A[Astart + 2] & 65535);
            T[3] = (A[Astart + 3] & 65535);
            var Q1 = BigInteger.DivideThreeWordsByTwo(T, 1, B0, B1);
            var Q0 = BigInteger.DivideThreeWordsByTwo(T, 0, B0, B1);
            Q[Qstart] = (Q0 & 65535);
            Q[Qstart + 1] = (Q1 & 65535);
        }
    };
    constructor['Baseline_Multiply2Opt2'] = constructor.Baseline_Multiply2Opt2 = function(R, rstart, a0, a1, B, bstart, istart, iend) {
        {
            var p;
            var c;
            var d;
            for (var i = istart; i < iend; i += 4) {
                var rsi = rstart + i;
                var b0 = (B[bstart + i] & 65535);
                var b1 = (B[bstart + i + 1] & 65535);
                p = a0 * b0;
                c = (p & 65535);
                d = ((p|0) >>> 16);
                R[rsi] = (c & 65535);
                c = (d & 65535);
                d = ((d|0) >>> 16);
                p = a0 * b1;
                p = p + (c & 65535);
                c = (p & 65535);
                d = d + ((p|0) >>> 16);
                p = a1 * b0;
                p = p + (c & 65535);
                c = (p & 65535);
                d = d + ((p|0) >>> 16);
                R[rsi + 1] = (c & 65535);
                p = a1 * b1;
                p = p + (d);
                R[rsi + 2] = ((p & 65535) & 65535);
                R[rsi + 3] = ((p >> 16) & 65535);
            }
        }
    };
    constructor['AtomicMultiplyOpt'] = constructor.AtomicMultiplyOpt = function(C, Cstart, A0, A1, B, Bstart, istart, iend) {
        var s;
        var d;
        var a1MinusA0 = (((A1|0) - A0) & 65535);
        A1 &= 65535;
        A0 &= 65535;
        {
            if (A1 >= A0) {
                for (var i = istart; i < iend; i += 4) {
                    var B0 = (B[Bstart + i] & 65535);
                    var B1 = (B[Bstart + i + 1] & 65535);
                    var csi = Cstart + i;
                    if (B0 >= B1) {
                        s = 0;
                        d = a1MinusA0 * (((B0|0) - B1) & 65535);
                    } else {
                        s = (a1MinusA0|0);
                        d = (s & 65535) * (((B0|0) - B1) & 65535);
                    }
                    var A0B0 = A0 * B0;
                    C[csi] = ((A0B0 & 65535) & 65535);
                    var a0b0high = (A0B0 >>> 16);
                    var A1B1 = A1 * B1;
                    var tempInt;
                    tempInt = a0b0high + (A0B0 & 65535) + (d & 65535) + (A1B1 & 65535);
                    C[csi + 1] = ((tempInt & 65535) & 65535);
                    tempInt = A1B1 + ((tempInt >> 16) & 65535) + a0b0high + ((d >> 16) & 65535) + ((A1B1 >> 16) & 65535) - (s & 65535);
                    C[csi + 2] = ((tempInt & 65535) & 65535);
                    C[csi + 3] = (((tempInt >> 16) & 65535) & 65535);
                }
            } else {
                for (var i = istart; i < iend; i += 4) {
                    var B0 = (B[Bstart + i] & 65535);
                    var B1 = (B[Bstart + i + 1] & 65535);
                    var csi = Cstart + i;
                    if (B0 > B1) {
                        s = (((B0|0) - B1) & 65535);
                        d = a1MinusA0 * (s & 65535);
                    } else {
                        s = 0;
                        d = (((A0|0) - A1) & 65535) * (((B1|0) - B0) & 65535);
                    }
                    var A0B0 = A0 * B0;
                    var a0b0high = (A0B0 >>> 16);
                    C[csi] = ((A0B0 & 65535) & 65535);
                    var A1B1 = A1 * B1;
                    var tempInt;
                    tempInt = a0b0high + (A0B0 & 65535) + (d & 65535) + (A1B1 & 65535);
                    C[csi + 1] = ((tempInt & 65535) & 65535);
                    tempInt = A1B1 + ((tempInt >> 16) & 65535) + a0b0high + ((d >> 16) & 65535) + ((A1B1 >> 16) & 65535) - (s & 65535);
                    C[csi + 2] = ((tempInt & 65535) & 65535);
                    C[csi + 3] = (((tempInt >> 16) & 65535) & 65535);
                }
            }
        }
    };
    constructor['AtomicMultiplyAddOpt'] = constructor.AtomicMultiplyAddOpt = function(C, Cstart, A0, A1, B, Bstart, istart, iend) {
        var s;
        var d;
        var a1MinusA0 = (((A1|0) - A0) & 65535);
        A1 &= 65535;
        A0 &= 65535;
        {
            if (A1 >= A0) {
                for (var i = istart; i < iend; i += 4) {
                    var B0 = (B[Bstart + i] & 65535);
                    var B1 = (B[Bstart + i + 1] & 65535);
                    var csi = Cstart + i;
                    if (B0 >= B1) {
                        s = 0;
                        d = a1MinusA0 * (((B0|0) - B1) & 65535);
                    } else {
                        s = (a1MinusA0|0);
                        d = (s & 65535) * (((B0|0) - B1) & 65535);
                    }
                    var A0B0 = A0 * B0;
                    var a0b0high = (A0B0 >>> 16);
                    var tempInt;
                    tempInt = A0B0 + (C[csi] & 65535);
                    C[csi] = ((tempInt & 65535) & 65535);
                    var A1B1 = A1 * B1;
                    var a1b1low = (A1B1 & 65535);
                    var a1b1high = ((A1B1 >> 16) & 65535);
                    tempInt = ((tempInt >> 16) & 65535) + (A0B0 & 65535) + (d & 65535) + a1b1low + (C[csi + 1] & 65535);
                    C[csi + 1] = ((tempInt & 65535) & 65535);
                    tempInt = ((tempInt >> 16) & 65535) + a1b1low + a0b0high + ((d >> 16) & 65535) + a1b1high - (s & 65535) + (C[csi + 2] & 65535);
                    C[csi + 2] = ((tempInt & 65535) & 65535);
                    tempInt = ((tempInt >> 16) & 65535) + a1b1high + (C[csi + 3] & 65535);
                    C[csi + 3] = ((tempInt & 65535) & 65535);
                    if ((tempInt >> 16) != 0) {
                        C[csi + 4] = ((C[csi + 4] + 1) & 65535);
                        C[csi + 5] = (((((C[csi + 5] + (((C[csi + 4] == 0) ? 1 : 0)|0)) & 65535))|0));
                    }
                }
            } else {
                for (var i = istart; i < iend; i += 4) {
                    var B0 = (B[Bstart + i] & 65535);
                    var B1 = (B[Bstart + i + 1] & 65535);
                    var csi = Cstart + i;
                    if (B0 > B1) {
                        s = (((B0|0) - B1) & 65535);
                        d = a1MinusA0 * (s & 65535);
                    } else {
                        s = 0;
                        d = (((A0|0) - A1) & 65535) * (((B1|0) - B0) & 65535);
                    }
                    var A0B0 = A0 * B0;
                    var a0b0high = (A0B0 >>> 16);
                    var tempInt;
                    tempInt = A0B0 + (C[csi] & 65535);
                    C[csi] = ((tempInt & 65535) & 65535);
                    var A1B1 = A1 * B1;
                    var a1b1low = (A1B1 & 65535);
                    var a1b1high = (A1B1 >>> 16);
                    tempInt = ((tempInt >> 16) & 65535) + (A0B0 & 65535) + (d & 65535) + a1b1low + (C[csi + 1] & 65535);
                    C[csi + 1] = ((tempInt & 65535) & 65535);
                    tempInt = ((tempInt >> 16) & 65535) + a1b1low + a0b0high + ((d >> 16) & 65535) + a1b1high - (s & 65535) + (C[csi + 2] & 65535);
                    C[csi + 2] = ((tempInt & 65535) & 65535);
                    tempInt = ((tempInt >> 16) & 65535) + a1b1high + (C[csi + 3] & 65535);
                    C[csi + 3] = ((tempInt & 65535) & 65535);
                    if ((tempInt >> 16) != 0) {
                        C[csi + 4] = ((C[csi + 4] + 1) & 65535);
                        C[csi + 5] = (((((C[csi + 5] + (((C[csi + 4] == 0) ? 1 : 0)|0)) & 65535))|0));
                    }
                }
            }
        }
    };
    constructor['Divide'] = constructor.Divide = function(Rarr, Rstart, Qarr, Qstart, TA, Tstart, Aarr, Astart, NAint, Barr, Bstart, NBint) {
        var NA = (NAint|0);
        var NB = (NBint|0);
        var TBarr = TA;
        var TParr = TA;
        var quot = Qarr;
        if (Qarr == null) {
            quot = [0, 0];
        }
        var quotStart = (Qarr == null) ? 0 : Qstart;
        var TBstart = ((Tstart + (NA + 2))|0);
        var TPstart = ((Tstart + (NA + 2 + NB))|0);
        {
            var shiftWords = ((Barr[Bstart + NB - 1] == 0 ? 1 : 0)|0);
            TBarr[TBstart] = 0;
            TBarr[TBstart + NB - 1] = 0;
            for (var arrfillI = 0; arrfillI < NB - shiftWords; arrfillI++) TBarr[((TBstart + shiftWords)|0) + arrfillI] = Barr[Bstart + arrfillI];
            var shiftBits = ((16 - BigInteger.BitPrecision(TBarr[TBstart + NB - 1]))|0);
            BigInteger.ShiftWordsLeftByBits(TBarr, TBstart, NB, shiftBits);
            TA[0] = 0;
            TA[NA] = 0;
            TA[NA + 1] = 0;
            for (var arrfillI = 0; arrfillI < NAint; arrfillI++) TA[((Tstart + shiftWords)|0) + arrfillI] = Aarr[Astart + arrfillI];
            BigInteger.ShiftWordsLeftByBits(TA, Tstart, NA + 2, shiftBits);
            if (TA[Tstart + NA + 1] == 0 && (TA[Tstart + NA] & 65535) <= 1) {
                if (Qarr != null) {
                    Qarr[Qstart + NA - NB + 1] = 0;
                    Qarr[Qstart + NA - NB] = 0;
                }
                while (TA[NA] != 0 || BigInteger.Compare(TA, ((Tstart + NA - NB)|0), TBarr, TBstart, NB) >= 0) {
                    TA[NA] = (((((TA[NA] - ((BigInteger.Subtract(TA, ((Tstart + NA - NB)|0), TA, ((Tstart + NA - NB)|0), TBarr, TBstart, NB))|0)) & 65535))|0));
                    if (Qarr != null) Qarr[Qstart + NA - NB] = ((Qarr[Qstart + NA - NB] + 1) & 65535);
                }
            } else {
                NA = NA + (2);
            }
            var BT0 = ((TBarr[TBstart + NB - 2] + 1)|0);
            var BT1 = ((TBarr[TBstart + NB - 1] + ((BT0 == 0 ? 1 : 0)|0))|0);
            var TAtomic = [0, 0, 0, 0];
            for (var i = NA - 2; i >= NB; i -= 2) {
                var qs = (Qarr == null) ? 0 : Qstart + i - NB;
                BigInteger.AtomicDivide(quot, qs, TA, ((Tstart + i - 2)|0), BT0, BT1, TAtomic);
                var Rstart2 = Tstart + i - NB;
                var N = NB;
                {
                    var Q0 = quot[qs];
                    var Q1 = quot[qs + 1];
                    if (Q1 == 0) {
                        var carry = BigInteger.LinearMultiply(TParr, TPstart, TBarr, TBstart, (Q0|0), N);
                        TParr[TPstart + N] = (carry & 65535);
                        TParr[TPstart + N + 1] = 0;
                    } else if (N == 2) {
                        BigInteger.Baseline_Multiply2(TParr, TPstart, quot, qs, TBarr, TBstart);
                    } else {
                        TParr[TPstart + N] = 0;
                        TParr[TPstart + N + 1] = 0;
                        Q0 &= 65535;
                        Q1 &= 65535;
                        BigInteger.AtomicMultiplyOpt(TParr, TPstart, Q0, Q1, TBarr, TBstart, 0, N);
                        BigInteger.AtomicMultiplyAddOpt(TParr, TPstart, Q0, Q1, TBarr, TBstart, 2, N);
                    }
                    BigInteger.Subtract(TA, Rstart2, TA, Rstart2, TParr, TPstart, N + 2);
                    while (TA[Rstart2 + N] != 0 || BigInteger.Compare(TA, Rstart2, TBarr, TBstart, N) >= 0) {
                        TA[Rstart2 + N] = (((((TA[Rstart2 + N] - ((BigInteger.Subtract(TA, Rstart2, TA, Rstart2, TBarr, TBstart, N))|0)) & 65535))|0));
                        if (Qarr != null) {
                            Qarr[qs] = ((Qarr[qs] + 1) & 65535);
                            Qarr[qs + 1] = (((((Qarr[qs + 1] + (((Qarr[qs] == 0) ? 1 : 0)|0)) & 65535))|0));
                        }
                    }
                }
            }
            if (Rarr != null) {
                for (var arrfillI = 0; arrfillI < NB; arrfillI++) Rarr[Rstart + arrfillI] = TA[((Tstart + shiftWords)|0) + arrfillI];
                BigInteger.ShiftWordsRightByBits(Rarr, Rstart, NB, shiftBits);
            }
        }
    };
    constructor['RoundupSizeTable'] = constructor.RoundupSizeTable = [2, 2, 2, 4, 4, 8, 8, 8, 8, 16, 16, 16, 16, 16, 16, 16, 16];
    constructor['RoundupSize'] = constructor.RoundupSize = function(n) {
        if (n <= 16) return BigInteger.RoundupSizeTable[n]; else if (n <= 32) return 32; else if (n <= 64) return 64; else return 1 << ((BigInteger.BitPrecisionInt(n - 1))|0);
    };
    prototype['negative'] = prototype.negative = null;
    prototype['wordCount'] = prototype.wordCount = -1;
    prototype['reg'] = prototype.reg = null;

    constructor['fromByteArray'] = constructor.fromByteArray = function(bytes, littleEndian) {
        var bigint = new BigInteger();
        bigint.fromByteArrayInternal(bytes, littleEndian);
        return bigint;
    };
    prototype['fromByteArrayInternal'] = prototype.fromByteArrayInternal = function(bytes, littleEndian) {
        if (bytes == null) throw new Error("bytes");
        if (bytes.length == 0) {
            this.reg = [0, 0];
            this.wordCount = 0;
        } else {
            var len = bytes.length;
            var wordLength = ((len|0) + 1) >> 1;
            wordLength = (wordLength <= 16) ? BigInteger.RoundupSizeTable[wordLength] : BigInteger.RoundupSize(wordLength);
            this.reg = [];
            for (var arrfillI = 0; arrfillI < wordLength; arrfillI++) this.reg[arrfillI] = 0;
            var jIndex = (littleEndian) ? len - 1 : 0;
            var negative = ((bytes[jIndex]) & 128) != 0;
            this.negative = negative;
            var j = 0;
            if (!negative) {
                for (var i = 0; i < len; i += 2, j++) {
                    var index = (littleEndian) ? i : len - 1 - i;
                    var index2 = (littleEndian) ? i + 1 : len - 2 - i;
                    this.reg[j] = ((bytes[index] & 255) & 65535);
                    if (index2 >= 0 && index2 < len) {
                        this.reg[j] = (((((this.reg[j] | (((((bytes[index2])|0) << 8)|0))) & 65535))|0));
                    }
                }
            } else {
                for (var i = 0; i < len; i += 2, j++) {
                    var index = (littleEndian) ? i : len - 1 - i;
                    var index2 = (littleEndian) ? i + 1 : len - 2 - i;
                    this.reg[j] = ((bytes[index] & 255) & 65535);
                    if (index2 >= 0 && index2 < len) {
                        this.reg[j] = (((((this.reg[j] | (((((bytes[index2])|0) << 8)|0))) & 65535))|0));
                    } else {

                        this.reg[j] = ((this.reg[j] | (65280)) & 65535);
                    }
                }
                for (; j < this.reg.length; j++) {
                    this.reg[j] = (65535 & 65535);
                }

                BigInteger.TwosComplement(this.reg, 0, ((this.reg.length)|0));
            }
            this.wordCount = this.reg.length;
            while (this.wordCount != 0 && this.reg[this.wordCount - 1] == 0) this.wordCount--;
        }
    };
    prototype['Allocate'] = prototype.Allocate = function(length) {
        this.reg = [];
        for (var arrfillI = 0; arrfillI < BigInteger.RoundupSize(length); arrfillI++) this.reg[arrfillI] = 0;

        this.negative = false;
        this.wordCount = 0;
        return this;
    };
    constructor['GrowForCarry'] = constructor.GrowForCarry = function(a, carry) {
        var oldLength = a.length;
        var ret = BigInteger.CleanGrow(a, BigInteger.RoundupSize(oldLength + 1));
        ret[oldLength] = (carry & 65535);
        return ret;
    };
    constructor['CleanGrow'] = constructor.CleanGrow = function(a, size) {
        if (size > a.length) {
            var newa = [];
            for (var arrfillI = 0; arrfillI < size; arrfillI++) newa[arrfillI] = 0;
            for (var arrfillI = 0; arrfillI < a.length; arrfillI++) newa[0 + arrfillI] = a[0 + arrfillI];
            return newa;
        }
        return a;
    };
    prototype['SetBitInternal'] = prototype.SetBitInternal = function(n, value) {
        if (value) {
            this.reg = BigInteger.CleanGrow(this.reg, BigInteger.RoundupSize(BigInteger.BitsToWords(n + 1)));
            this.reg[(n >> 4)] = (((((this.reg[n >> 4] | ((((1) & 65535) << (n & 15))|0)) & 65535))|0));
            this.wordCount = this.CalcWordCount();
        } else {
            if ((n >> 4) < this.reg.length) this.reg[(n >> 4)] = (((((this.reg[n >> 4] & ((((~(1 << ((n % 16)|0))))|0))) & 65535))|0));
            this.wordCount = this.CalcWordCount();
        }
    };

    prototype['testBit'] = prototype.testBit = function(index) {
        if (index < 0) throw new Error("index");
        if (this.signum() < 0) {
            var tcindex = 0;
            var wordpos = ((index / 16)|0);
            if (wordpos >= this.reg.length) return true;
            while (tcindex < wordpos && this.reg[tcindex] == 0) {
                tcindex++;
            }
            var tc;
            {
                tc = this.reg[wordpos];
                if (tcindex == wordpos) tc--;
                tc = ((~tc)|0);
            }
            return (((tc >> (index & 15)) & 1) != 0);
        } else {
            return this.GetUnsignedBit(index);
        }
    };

    prototype['GetUnsignedBit'] = prototype.GetUnsignedBit = function(n) {
        if ((n >> 4) >= this.reg.length) return false; else return (((this.reg[n >> 4] >> (n & 15)) & 1) != 0);
    };
    prototype['InitializeInt'] = prototype.InitializeInt = function(numberValue) {
        var iut;
        {
            this.negative = (numberValue < 0);
            if (numberValue == -2147483648) {
                this.reg = [0, 0];
                this.reg[0] = 0;
                this.reg[1] = (32768 & 65535);
                this.wordCount = 2;
            } else {
                iut = ((numberValue < 0) ? ((-numberValue)|0) : (numberValue|0));
                this.reg = [0, 0];
                this.reg[0] = (iut & 65535);
                this.reg[1] = ((iut >> 16) & 65535);
                this.wordCount = (this.reg[1] != 0 ? 2 : (this.reg[0] == 0 ? 0 : 1));
            }
        }
        return this;
    };

    prototype['toByteArray'] = prototype.toByteArray = function(littleEndian) {
        var sign = this.signum();
        if (sign == 0) {
            return [0];
        } else if (sign > 0) {
            var byteCount = this.ByteCount();
            var byteArrayLength = byteCount;
            if (this.GetUnsignedBit((byteCount * 8) - 1)) {
                byteArrayLength++;
            }
            var bytes = [];
            for (var arrfillI = 0; arrfillI < byteArrayLength; arrfillI++) bytes[arrfillI] = 0;
            var j = 0;
            for (var i = 0; i < byteCount; i += 2, j++) {
                var index = (littleEndian) ? i : bytes.length - 1 - i;
                var index2 = (littleEndian) ? i + 1 : bytes.length - 2 - i;
                bytes[index] = ((this.reg[j]) & 255);
                if (index2 >= 0 && index2 < byteArrayLength) {
                    bytes[index2] = ((this.reg[j] >> 8) & 255);
                }
            }
            return bytes;
        } else {
            var regdata = [];
            for (var arrfillI = 0; arrfillI < this.reg.length; arrfillI++) regdata[arrfillI] = 0;
            for (var arrfillI = 0; arrfillI < this.reg.length; arrfillI++) regdata[0 + arrfillI] = this.reg[0 + arrfillI];
            BigInteger.TwosComplement(regdata, 0, ((regdata.length)|0));
            var byteCount = regdata.length * 2;
            for (var i = regdata.length - 1; i >= 0; i--) {
                if (regdata[i] == (65535)) {
                    byteCount -= 2;
                } else if ((regdata[i] & 65408) == 65408) {

                    byteCount -= 1;
                    break;
                } else if ((regdata[i] & 32768) == 32768) {

                    break;
                } else {

                    byteCount = byteCount + (1);
                    break;
                }
            }
            if (byteCount == 0) byteCount = 1;
            var bytes = [];
            for (var arrfillI = 0; arrfillI < byteCount; arrfillI++) bytes[arrfillI] = 0;
            bytes[(littleEndian) ? bytes.length - 1 : 0] = 255;
            byteCount = (byteCount < regdata.length * 2 ? byteCount : regdata.length * 2);
            var j = 0;
            for (var i = 0; i < byteCount; i += 2, j++) {
                var index = (littleEndian) ? i : bytes.length - 1 - i;
                var index2 = (littleEndian) ? i + 1 : bytes.length - 2 - i;
                bytes[index] = (regdata[j] & 255);
                if (index2 >= 0 && index2 < byteCount) {
                    bytes[index2] = ((regdata[j] >> 8) & 255);
                }
            }
            return bytes;
        }
    };

    prototype['shiftLeft'] = prototype.shiftLeft = function(numberBits) {
        if (numberBits == 0) return this;
        if (numberBits < 0) {
            if (numberBits == -2147483648) return this.shiftRight(1).shiftRight(2147483647);
            return this.shiftRight(-numberBits);
        }
        var ret = new BigInteger();
        var numWords = ((this.wordCount)|0);
        var shiftWords = ((numberBits >> 4)|0);
        var shiftBits = (numberBits & 15);
        var neg = numWords > 0 && this.negative;
        if (!neg) {
            ret.negative = false;
            ret.reg = [];
            for (var arrfillI = 0; arrfillI < BigInteger.RoundupSize(numWords + BigInteger.BitsToWords(numberBits|0)); arrfillI++) ret.reg[arrfillI] = 0;
            for (var arrfillI = 0; arrfillI < numWords; arrfillI++) ret.reg[0 + arrfillI] = this.reg[0 + arrfillI];
            BigInteger.ShiftWordsLeftByWords(ret.reg, 0, numWords + shiftWords, shiftWords);
            BigInteger.ShiftWordsLeftByBits(ret.reg, (shiftWords|0), numWords + BigInteger.BitsToWords(shiftBits), shiftBits);
            ret.wordCount = ret.CalcWordCount();
        } else {
            ret.negative = true;
            ret.reg = [];
            for (var arrfillI = 0; arrfillI < BigInteger.RoundupSize(numWords + BigInteger.BitsToWords(numberBits|0)); arrfillI++) ret.reg[arrfillI] = 0;
            for (var arrfillI = 0; arrfillI < numWords; arrfillI++) ret.reg[0 + arrfillI] = this.reg[0 + arrfillI];
            BigInteger.TwosComplement(ret.reg, 0, ((ret.reg.length)|0));
            BigInteger.ShiftWordsLeftByWords(ret.reg, 0, numWords + shiftWords, shiftWords);
            BigInteger.ShiftWordsLeftByBits(ret.reg, (shiftWords|0), numWords + BigInteger.BitsToWords(shiftBits), shiftBits);
            BigInteger.TwosComplement(ret.reg, 0, ((ret.reg.length)|0));
            ret.wordCount = ret.CalcWordCount();
        }
        return ret;
    };

    prototype['shiftRight'] = prototype.shiftRight = function(numberBits) {
        if (numberBits == 0) return this;
        if (numberBits < 0) {
            if (numberBits == -2147483648) return this.shiftLeft(1).shiftLeft(2147483647);
            return this.shiftLeft(-numberBits);
        }
        var ret = new BigInteger();
        var numWords = ((this.wordCount)|0);
        var shiftWords = ((numberBits >> 4)|0);
        var shiftBits = (numberBits & 15);
        ret.negative = this.negative;
        ret.reg = [];
        for (var arrfillI = 0; arrfillI < BigInteger.RoundupSize(numWords); arrfillI++) ret.reg[arrfillI] = 0;
        for (var arrfillI = 0; arrfillI < numWords; arrfillI++) ret.reg[0 + arrfillI] = this.reg[0 + arrfillI];
        if (this.signum() < 0) {
            BigInteger.TwosComplement(ret.reg, 0, ((ret.reg.length)|0));
            BigInteger.ShiftWordsRightByWordsSignExtend(ret.reg, 0, numWords, shiftWords);
            if (numWords > shiftWords) BigInteger.ShiftWordsRightByBitsSignExtend(ret.reg, 0, numWords - shiftWords, shiftBits);
            BigInteger.TwosComplement(ret.reg, 0, ((ret.reg.length)|0));
        } else {
            BigInteger.ShiftWordsRightByWords(ret.reg, 0, numWords, shiftWords);
            if (numWords > shiftWords) BigInteger.ShiftWordsRightByBits(ret.reg, 0, numWords - shiftWords, shiftBits);
        }
        ret.wordCount = ret.CalcWordCount();
        return ret;
    };

    constructor['valueOf'] = constructor.valueOf = function(longerValue_obj) {
        var longerValue = JSInteropFactory.createLong(longerValue_obj);
        if (longerValue.signum() == 0) return BigInteger.ZERO;
        if (longerValue.equalsInt(1)) return BigInteger.ONE;
        var ret = new BigInteger();
        {
            ret.negative = (longerValue.signum() < 0);
            ret.reg = [0, 0, 0, 0];
            if (longerValue.equals(JSInteropFactory.LONG_MIN_VALUE())) {
                ret.reg[0] = 0;
                ret.reg[1] = 0;
                ret.reg[2] = 0;
                ret.reg[3] = (32768 & 65535);
                ret.wordCount = 4;
            } else {
                var ut = longerValue;
                if (ut.signum() < 0) ut = ut.negate();
                ret.reg[0] = (((((ut.andInt(65535).shortValue()) & 65535))|0));
                ut = ut.shiftRight(16);
                ret.reg[1] = (((((ut.andInt(65535).shortValue()) & 65535))|0));
                ut = ut.shiftRight(16);
                ret.reg[2] = (((((ut.andInt(65535).shortValue()) & 65535))|0));
                ut = ut.shiftRight(16);
                ret.reg[3] = (((((ut.andInt(65535).shortValue()) & 65535))|0));

                ret.wordCount = 4;
                while (ret.wordCount != 0 && ret.reg[ret.wordCount - 1] == 0) ret.wordCount--;
            }
        }
        return ret;
    };

    prototype['intValue'] = prototype.intValue = function() {
        var c = ((this.wordCount)|0);
        if (c == 0) return 0;
        if (c > 2) throw new Error();
        if (c == 2 && (this.reg[1] & 32768) != 0) {
            if ((((this.reg[1] & 32767)|0) | this.reg[0]) == 0 && this.negative) {
                return -2147483648;
            } else {
                throw new Error();
            }
        } else {
            var ivv = ((this.reg[0]) & 65535);
            if (c > 1) ivv |= ((this.reg[1]) & 65535) << 16;
            if (this.negative) ivv = -ivv;
            return ivv;
        }
    };

    prototype['canFitInInt'] = prototype.canFitInInt = function() {
        var c = ((this.wordCount)|0);
        if (c > 2) return false;
        if (c == 2 && (this.reg[1] & 32768) != 0) {
            return (this.negative && this.reg[1] == (32768) && this.reg[0] == 0);
        }
        return true;
    };
    prototype['HasSmallValue'] = prototype.HasSmallValue = function() {
        var c = ((this.wordCount)|0);
        if (c > 4) return false;
        if (c == 4 && (this.reg[3] & 32768) != 0) {
            return (this.negative && this.reg[3] == (32768) && this.reg[2] == 0 && this.reg[1] == 0 && this.reg[0] == 0);
        }
        return true;
    };

    prototype['longValue'] = prototype.longValue = function() {
        var count = this.wordCount;
        if (count == 0) return JSInteropFactory.createLong(0);
        if (count > 4) throw new Error();
        if (count == 4 && (this.reg[3] & 32768) != 0) {
            if (this.negative && this.reg[3] == (32768) && this.reg[2] == 0 && this.reg[1] == 0 && this.reg[0] == 0) {
                return JSInteropFactory.LONG_MIN_VALUE();
            } else {
                throw new Error();
            }
        } else {
            var tmp = ((this.reg[0])|0) & 65535;
            var vv = JSInteropFactory.createLong(tmp);
            if (count > 1) {
                tmp = ((this.reg[1])|0) & 65535;
                vv = vv.or((JSInteropFactory.createLong(tmp)).shiftLeft(16));
            }
            if (count > 2) {
                tmp = ((this.reg[2])|0) & 65535;
                vv = vv.or((JSInteropFactory.createLong(tmp)).shiftLeft(32));
            }
            if (count > 3) {
                tmp = ((this.reg[3])|0) & 65535;
                vv = vv.or((JSInteropFactory.createLong(tmp)).shiftLeft(48));
            }
            if (this.negative) vv = vv.negate();
            return vv;
        }
    };
    constructor['Power2'] = constructor.Power2 = function(e) {
        var r = new BigInteger().Allocate(BigInteger.BitsToWords((e + 1)|0));
        r.SetBitInternal((e|0), true);

        return r;
    };

    prototype['PowBigIntVar'] = prototype.PowBigIntVar = function(power) {
        if ((power) == null) throw new Error("power");
        var sign = power.signum();
        if (sign < 0) throw new Error("power is negative");
        var thisVar = this;
        if (sign == 0) return BigInteger.ONE; else if (power.equals(BigInteger.ONE)) return this; else if (power.wordCount == 1 && power.reg[0] == 2) return thisVar.multiply(thisVar); else if (power.wordCount == 1 && power.reg[0] == 3) return (thisVar.multiply(thisVar)).multiply(thisVar);

        var r = BigInteger.ONE;
        while (power.signum() != 0) {
            if (power.testBit(0)) {
                r = (r.multiply(thisVar));
            }
            power = power.shiftRight(1);
            if (power.signum() != 0) {
                thisVar = (thisVar.multiply(thisVar));
            }
        }
        return r;
    };

    prototype['pow'] = prototype.pow = function(powerSmall) {
        if (powerSmall < 0) throw new Error("power is negative");
        var thisVar = this;
        if (powerSmall == 0) return BigInteger.ONE; else if (powerSmall == 1) return this; else if (powerSmall == 2) return thisVar.multiply(thisVar); else if (powerSmall == 3) return (thisVar.multiply(thisVar)).multiply(thisVar);

        var r = BigInteger.ONE;
        while (powerSmall != 0) {
            if ((powerSmall & 1) != 0) {
                r = (r.multiply(thisVar));
            }
            powerSmall >>= 1;
            if (powerSmall != 0) {
                thisVar = (thisVar.multiply(thisVar));
            }
        }
        return r;
    };

    prototype['negate'] = prototype.negate = function() {
        var bigintRet = new BigInteger();
        bigintRet.reg = this.reg;

        bigintRet.wordCount = this.wordCount;
        bigintRet.negative = (this.wordCount != 0) && (!this.negative);
        return bigintRet;
    };

    prototype['abs'] = prototype.abs = function() {
        return (this.wordCount == 0 || !this.negative) ? this : this.negate();
    };

    prototype['CalcWordCount'] = prototype.CalcWordCount = function() {
        return ((BigInteger.CountWords(this.reg, this.reg.length))|0);
    };

    prototype['ByteCount'] = prototype.ByteCount = function() {
        var wc = this.wordCount;
        if (wc == 0) return 0;
        var s = this.reg[wc - 1];
        wc = (wc - 1) << 1;
        if (s == 0) return wc;
        return ((s >> 8) == 0) ? wc + 1 : wc + 2;
    };

    prototype['getUnsignedBitLength'] = prototype.getUnsignedBitLength = function() {
        var wc = this.wordCount;
        if (wc != 0) {
            var numberValue = ((this.reg[wc - 1]) & 65535);
            wc = (wc - 1) << 4;
            if (numberValue == 0) return wc;
            wc = wc + (16);
            {
                if ((numberValue >> 8) == 0) {
                    numberValue <<= 8;
                    wc -= 8;
                }
                if ((numberValue >> 12) == 0) {
                    numberValue <<= 4;
                    wc -= 4;
                }
                if ((numberValue >> 14) == 0) {
                    numberValue <<= 2;
                    wc -= 2;
                }
                if ((numberValue >> 15) == 0) --wc;
            }
            return wc;
        } else {
            return 0;
        }
    };

    prototype['getUnsignedBitLengthEx'] = prototype.getUnsignedBitLengthEx = function(numberValue, wordCount) {
        var wc = wordCount;
        if (wc != 0) {
            wc = (wc - 1) << 4;
            if (numberValue == 0) return wc;
            wc = wc + (16);
            {
                if ((numberValue >> 8) == 0) {
                    numberValue <<= 8;
                    wc -= 8;
                }
                if ((numberValue >> 12) == 0) {
                    numberValue <<= 4;
                    wc -= 4;
                }
                if ((numberValue >> 14) == 0) {
                    numberValue <<= 2;
                    wc -= 2;
                }
                if ((numberValue >> 15) == 0) --wc;
            }
            return wc;
        } else {
            return 0;
        }
    };

    prototype['bitLength'] = prototype.bitLength = function() {
        var wc = this.wordCount;
        if (wc != 0) {
            var numberValue = ((this.reg[wc - 1]) & 65535);
            wc = (wc - 1) << 4;
            if (numberValue == (this.negative ? 1 : 0)) return wc;
            wc = wc + (16);
            {
                if (this.negative) {
                    numberValue--;
                    numberValue &= 65535;
                }
                if ((numberValue >> 8) == 0) {
                    numberValue <<= 8;
                    wc -= 8;
                }
                if ((numberValue >> 12) == 0) {
                    numberValue <<= 4;
                    wc -= 4;
                }
                if ((numberValue >> 14) == 0) {
                    numberValue <<= 2;
                    wc -= 2;
                }
                return ((numberValue >> 15) == 0) ? wc - 1 : wc;
            }
        } else {
            return 0;
        }
    };
    constructor['vec'] = constructor.vec = "0123456789ABCDEF";
    constructor['ReverseChars'] = constructor.ReverseChars = function(chars, offset, length) {
        var half = length >> 1;
        var right = offset + length - 1;
        for (var i = 0; i < half; i++, right--) {
            var value = chars[offset + i];
            chars[offset + i] = chars[right];
            chars[right] = value;
        }
    };
    prototype['SmallValueToString'] = prototype.SmallValueToString = function() {
        var value = this.longValue();
        if (value.equals(JSInteropFactory.LONG_MIN_VALUE())) return "-9223372036854775808";
        var neg = (value.signum() < 0);
        var chars = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var count = 0;
        if (neg) {
            chars[0] = '-';
            count++;
            value = value.negate();
        }
        while (value.signum() != 0) {
            var digit = BigInteger.vec.charAt(value.remainderWithUnsignedDivisor(10).intValue());
            chars[count++] = digit;
            value = value.divideWithUnsignedDivisor(10);
        }
        if (neg) BigInteger.ReverseChars(chars, 1, count - 1); else BigInteger.ReverseChars(chars, 0, count);
        var tmpbuilder = JSInteropFactory.createStringBuilder(16);
        for (var arrfillI = 0; arrfillI < count; arrfillI++) tmpbuilder.append(chars[arrfillI]);
        return tmpbuilder.toString();
    };
    prototype['ApproxLogTenOfTwo'] = prototype.ApproxLogTenOfTwo = function(bitlen) {
        var bitlenLow = (bitlen & 65535);
        var bitlenHigh = (bitlen >>> 16);
        var resultLow = 0;
        var resultHigh = 0;
        {
            var p;
            var c;
            var d;
            p = bitlenLow * 34043;
            d = ((p|0) >>> 16);
            c = (d & 65535);
            d = ((d|0) >>> 16);
            p = bitlenLow * 8346;
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            p = bitlenHigh * 34043;
            p = p + (c & 65535);
            d = d + ((p|0) >>> 16);
            c = (d & 65535);
            d = ((d|0) >>> 16);
            p = bitlenLow * 154;
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            p = bitlenHigh * 8346;
            p = p + (c & 65535);
            c = (p & 65535);
            d = d + ((p|0) >>> 16);
            p = (c & 65535);
            c = (p & 65535);
            resultLow = c;
            c = (d & 65535);
            d = ((d|0) >>> 16);
            p = bitlenHigh * 154;
            p = p + (c & 65535);
            resultHigh = (p & 65535);
            var result = (resultLow & 65535);
            result |= (resultHigh & 65535) << 16;
            return (result & 2147483647) >> 9;
        }
    };

    prototype['getDigitCount'] = prototype.getDigitCount = function() {
        if (this.signum() == 0) return 1;
        if (this.HasSmallValue()) {
            var value = this.longValue();
            if (value.equals(JSInteropFactory.LONG_MIN_VALUE())) return 19;
            if (value.signum() < 0) value = value.negate();
            if (value.compareToInt(1000000000) >= 0) {
                if (value.compareToLongAsInts(-1486618624, 232830643) >= 0) return 19;
                if (value.compareToLongAsInts(1569325056, 23283064) >= 0) return 18;
                if (value.compareToLongAsInts(1874919424, 2328306) >= 0) return 17;
                if (value.compareToLongAsInts(-1530494976, 232830) >= 0) return 16;
                if (value.compareToLongAsInts(276447232, 23283) >= 0) return 15;
                if (value.compareToLongAsInts(1316134912, 2328) >= 0) return 14;
                if (value.compareToLongAsInts(-727379968, 232) >= 0) return 13;
                if (value.compareToLongAsInts(1215752192, 23) >= 0) return 12;
                if (value.compareToLongAsInts(1410065408, 2) >= 0) return 11;
                if (value.compareToInt(1000000000) >= 0) return 10;
                return 9;
            } else {
                var v2 = value.intValue();
                if (v2 >= 100000000) return 9;
                if (v2 >= 10000000) return 8;
                if (v2 >= 1000000) return 7;
                if (v2 >= 100000) return 6;
                if (v2 >= 10000) return 5;
                if (v2 >= 1000) return 4;
                if (v2 >= 100) return 3;
                if (v2 >= 10) return 2;
                return 1;
            }
        }
        var bitlen = this.getUnsignedBitLength();
        if (bitlen <= 2135) {

            var minDigits = 1 + (((bitlen - 1) * 631305) >> 21);
            var maxDigits = 1 + (((bitlen) * 631305) >> 21);
            if (minDigits == maxDigits) {

                return minDigits;
            }
        } else if (bitlen <= 6432162) {

            var minDigits = this.ApproxLogTenOfTwo(bitlen - 1);
            var maxDigits = this.ApproxLogTenOfTwo(bitlen);
            if (minDigits == maxDigits) {

                return 1 + minDigits;
            }
        }
        var tempReg = null;
        var wordCount = this.wordCount;
        var i = 0;
        while (wordCount != 0) {
            if (wordCount == 1) {
                var rest = (tempReg[0] & 65535);
                if (rest >= 10000) i += 5; else if (rest >= 1000) i += 4; else if (rest >= 100) i += 3; else if (rest >= 10) i += 2; else i++;
                break;
            } else if (wordCount == 2 && tempReg[1] > 0 && tempReg[1] <= 32767) {
                var rest = (tempReg[0] & 65535);
                rest |= ((tempReg[1] & 65535) << 16);
                if (rest >= 1000000000) i += 10; else if (rest >= 100000000) i += 9; else if (rest >= 10000000) i += 8; else if (rest >= 1000000) i += 7; else if (rest >= 100000) i += 6; else if (rest >= 10000) i += 5; else if (rest >= 1000) i += 4; else if (rest >= 100) i += 3; else if (rest >= 10) i += 2; else i++;
                break;
            } else {
                var wci = wordCount;
                var remainder = 0;
                var quo, rem;
                var firstdigit = false;
                var dividend = (tempReg == null) ? this.reg : tempReg;

                while ((wci--) > 0) {
                    var curValue = (dividend[wci] & 65535);
                    var currentDividend = (((curValue | ((remainder|0) << 16))|0));
                    quo = ((currentDividend / 10000)|0);
                    if (!firstdigit && quo != 0) {
                        firstdigit = true;

                        bitlen = this.getUnsignedBitLengthEx(quo, wci + 1);
                        if (bitlen <= 2135) {

                            var minDigits = 1 + (((bitlen - 1) * 631305) >> 21);
                            var maxDigits = 1 + (((bitlen) * 631305) >> 21);
                            if (minDigits == maxDigits) {

                                return i + minDigits + 4;
                            }
                        } else if (bitlen <= 6432162) {

                            var minDigits = this.ApproxLogTenOfTwo(bitlen - 1);
                            var maxDigits = this.ApproxLogTenOfTwo(bitlen);
                            if (minDigits == maxDigits) {

                                return i + 1 + minDigits + 4;
                            }
                        }
                    }
                    if (tempReg == null) {
                        if (quo != 0) {
                            tempReg = [];
                            for (var arrfillI = 0; arrfillI < this.wordCount; arrfillI++) tempReg[arrfillI] = 0;
                            for (var arrfillI = 0; arrfillI < tempReg.length; arrfillI++) tempReg[0 + arrfillI] = this.reg[0 + arrfillI];

                            wordCount = wci + 1;
                            tempReg[wci] = (quo & 65535);
                        }
                    } else {
                        tempReg[wci] = (quo & 65535);
                    }
                    rem = currentDividend - (10000 * quo);
                    remainder = (rem|0);
                }

                while (wordCount != 0 && tempReg[wordCount - 1] == 0) wordCount--;
                i = i + (4);
            }
        }
        return i;
    };

    prototype['toString'] = prototype.toString = function() {
        if (this.signum() == 0) return "0";
        if (this.HasSmallValue()) {
            return this.SmallValueToString();
        }
        var tempReg = [];
        for (var arrfillI = 0; arrfillI < this.wordCount; arrfillI++) tempReg[arrfillI] = 0;
        for (var arrfillI = 0; arrfillI < tempReg.length; arrfillI++) tempReg[0 + arrfillI] = this.reg[0 + arrfillI];
        var wordCount = tempReg.length;
        while (wordCount != 0 && tempReg[wordCount - 1] == 0) wordCount--;
        var i = 0;
        var s = [];
        for (var arrfillI = 0; arrfillI < (wordCount << 4) + 1; arrfillI++) s[arrfillI] = 0;
        while (wordCount != 0) {
            if (wordCount == 1 && tempReg[0] > 0 && tempReg[0] <= 32767) {
                var rest = tempReg[0];
                while (rest != 0) {

                    var newrest = (rest * 26215) >> 18;
                    s[i++] = BigInteger.vec.charAt(rest - (newrest * 10));
                    rest = newrest;
                }
                break;
            } else if (wordCount == 2 && tempReg[1] > 0 && tempReg[1] <= 32767) {
                var rest = (tempReg[0] & 65535);
                rest |= (tempReg[1] & 65535) << 16;
                while (rest != 0) {
                    var newrest = ((rest / 10)|0);
                    s[i++] = BigInteger.vec.charAt(rest - (newrest * 10));
                    rest = newrest;
                }
                break;
            } else {
                var wci = wordCount;
                var remainder = 0;
                var quo, rem;

                while ((wci--) > 0) {
                    var currentDividend = ((((tempReg[wci] & 65535) | ((remainder|0) << 16))|0));
                    quo = ((currentDividend / 10000)|0);
                    tempReg[wci] = (quo & 65535);
                    rem = currentDividend - (10000 * quo);
                    remainder = (rem|0);
                }
                var remainderSmall = remainder;

                while (wordCount != 0 && tempReg[wordCount - 1] == 0) wordCount--;

                var newrest = (remainderSmall * 3277) >> 15;
                s[i++] = BigInteger.vec.charAt((remainderSmall - (newrest * 10))|0);
                remainderSmall = newrest;
                newrest = (remainderSmall * 3277) >> 15;
                s[i++] = BigInteger.vec.charAt((remainderSmall - (newrest * 10))|0);
                remainderSmall = newrest;
                newrest = (remainderSmall * 3277) >> 15;
                s[i++] = BigInteger.vec.charAt((remainderSmall - (newrest * 10))|0);
                remainderSmall = newrest;
                s[i++] = BigInteger.vec.charAt(remainderSmall);
            }
        }
        BigInteger.ReverseChars(s, 0, i);
        if (this.negative) {
            var sb = JSInteropFactory.createStringBuilder(i + 1);
            sb.append('-');
            for (var arrfillI = 0; arrfillI < (0) + (i); arrfillI++) sb.append(s[arrfillI]);
            return sb.toString();
        } else {
            var tmpbuilder = JSInteropFactory.createStringBuilder(16);
            for (var arrfillI = 0; arrfillI < i; arrfillI++) tmpbuilder.append(s[arrfillI]);
            return tmpbuilder.toString();
        }
    };

    constructor['fromString'] = constructor.fromString = function(str) {
        if ((str) == null) throw new Error("str");
        return BigInteger.fromSubstring(str, 0, str.length);
    };
    constructor['MaxSafeInt'] = constructor.MaxSafeInt = 214748363;
    constructor['fromSubstring'] = constructor.fromSubstring = function(str, index, endIndex) {
        if ((str) == null) throw new Error("str");
        if ((index) < 0) throw new Error("\"str\"" + " not greater or equal to " + "0" + " (" + (JSInteropFactory.createLong(index)) + ")");
        if ((index) > str.length) throw new Error("\"str\"" + " not less or equal to " + (JSInteropFactory.createLong(str.length)) + " (" + (JSInteropFactory.createLong(index)) + ")");
        if ((endIndex) < 0) throw new Error("\"index\"" + " not greater or equal to " + "0" + " (" + (JSInteropFactory.createLong(endIndex)) + ")");
        if ((endIndex) > str.length) throw new Error("\"index\"" + " not less or equal to " + (JSInteropFactory.createLong(str.length)) + " (" + (JSInteropFactory.createLong(endIndex)) + ")");
        if ((endIndex) < index) throw new Error("\"endIndex\"" + " not greater or equal to " + (JSInteropFactory.createLong(index)) + " (" + (JSInteropFactory.createLong(endIndex)) + ")");
        if (index == endIndex) throw new Error("No digits");
        var negative = false;
        if (str.charAt(0) == '-') {
            index++;
            negative = true;
        }
        var bigint = new BigInteger().Allocate(4);
        var haveDigits = false;
        var haveSmallInt = true;
        var smallInt = 0;
        for (var i = index; i < endIndex; i++) {
            var c = str.charAt(i);
            if (c < '0' || c > '9') throw new Error("Illegal character found");
            haveDigits = true;
            var digit = ((c.charCodeAt(0))-48);
            if (haveSmallInt && smallInt < BigInteger.MaxSafeInt) {
                smallInt *= 10;
                smallInt = smallInt + (digit);
            } else {
                if (haveSmallInt) {
                    bigint.reg[0] = (((smallInt) & 65535) & 65535);
                    bigint.reg[1] = ((smallInt >>> 16) & 65535);
                    haveSmallInt = false;
                }

                var carry = 0;
                var N = bigint.reg.length;
                for (var j = 0; j < N; j++) {
                    var p;
                    {
                        p = ((bigint.reg[j]) & 65535) * 10;
                        p = p + (carry & 65535);
                        bigint.reg[j] = ((p & 65535) & 65535);
                        carry = ((p >> 16)|0);
                    }
                }
                if (carry != 0) bigint.reg = BigInteger.GrowForCarry(bigint.reg, carry);

                if (digit != 0) {
                    var d = (bigint.reg[0]) & 65535;
                    if (d <= 65526) {
                        bigint.reg[0] = ((d + digit) & 65535);
                    } else if (BigInteger.Increment(bigint.reg, 0, bigint.reg.length, (digit|0)) != 0) {
                        bigint.reg = BigInteger.GrowForCarry(bigint.reg, 1);
                    }
                }
            }
        }
        if (!haveDigits) throw new Error("No digits");
        if (haveSmallInt) {
            bigint.reg[0] = (((smallInt) & 65535) & 65535);
            bigint.reg[1] = ((smallInt >>> 16) & 65535);
        }
        bigint.wordCount = bigint.CalcWordCount();
        bigint.negative = (bigint.wordCount != 0 && negative);
        return bigint;
    };

    prototype['gcd'] = prototype.gcd = function(bigintSecond) {
        if ((bigintSecond) == null) throw new Error("bigintSecond");
        if (this.signum() == 0) return (bigintSecond).abs();
        if (bigintSecond.signum() == 0) return (this).abs();
        var thisValue = this.abs();
        bigintSecond = bigintSecond.abs();
        if (bigintSecond.equals(BigInteger.ONE) || thisValue.equals(bigintSecond)) return bigintSecond;
        if (thisValue.equals(BigInteger.ONE)) return thisValue;
        var temp;
        while (thisValue.signum() != 0) {
            if (thisValue.compareTo(bigintSecond) < 0) {
                temp = thisValue;
                thisValue = bigintSecond;
                bigintSecond = temp;
            }
            thisValue = thisValue.remainder(bigintSecond);
        }
        return bigintSecond;
    };

    prototype['ModPow'] = prototype.ModPow = function(pow, mod) {
        if ((pow) == null) throw new Error("pow");
        if (pow.signum() < 0) throw new Error("pow is negative");
        var r = BigInteger.ONE;
        var v = this;
        while (pow.signum() != 0) {
            if (pow.testBit(0)) {
                r = (r.multiply(v)).remainder(mod);
            }
            pow = pow.shiftRight(1);
            if (pow.signum() != 0) {
                v = (v.multiply(v)).remainder(mod);
            }
        }
        return r;
    };
    constructor['PositiveAdd'] = constructor.PositiveAdd = function(sum, bigintAddend, bigintAugend) {
        var carry;
        var addendCount = bigintAddend.wordCount + (bigintAddend.wordCount & 1);
        var augendCount = bigintAugend.wordCount + (bigintAugend.wordCount & 1);
        var desiredLength = (addendCount > augendCount ? addendCount : augendCount);
        if (addendCount == augendCount) carry = BigInteger.Add(sum.reg, 0, bigintAddend.reg, 0, bigintAugend.reg, 0, (addendCount|0)); else if (addendCount > augendCount) {

            carry = BigInteger.Add(sum.reg, 0, bigintAddend.reg, 0, bigintAugend.reg, 0, (augendCount|0));
            for (var arrfillI = 0; arrfillI < addendCount - augendCount; arrfillI++) sum.reg[augendCount + arrfillI] = bigintAddend.reg[augendCount + arrfillI];
            carry = BigInteger.Increment(sum.reg, augendCount, ((addendCount - augendCount)|0), (carry|0));
        } else {

            carry = BigInteger.Add(sum.reg, 0, bigintAddend.reg, 0, bigintAugend.reg, 0, (addendCount|0));
            for (var arrfillI = 0; arrfillI < augendCount - addendCount; arrfillI++) sum.reg[addendCount + arrfillI] = bigintAugend.reg[addendCount + arrfillI];
            carry = BigInteger.Increment(sum.reg, addendCount, ((augendCount - addendCount)|0), (carry|0));
        }
        if (carry != 0) {
            var nextIndex = desiredLength;
            var len = BigInteger.RoundupSize(nextIndex + 1);
            sum.reg = BigInteger.CleanGrow(sum.reg, len);
            sum.reg[nextIndex] = (carry & 65535);
        }
        sum.negative = false;
        sum.wordCount = sum.CalcWordCount();
        sum.ShortenArray();
    };
    constructor['PositiveSubtract'] = constructor.PositiveSubtract = function(diff, minuend, subtrahend) {
        var aSize = minuend.wordCount;
        aSize = aSize + (aSize % 2);
        var bSize = subtrahend.wordCount;
        bSize = bSize + (bSize % 2);
        if (aSize == bSize) {
            if (BigInteger.Compare(minuend.reg, 0, subtrahend.reg, 0, (aSize|0)) >= 0) {

                BigInteger.Subtract(diff.reg, 0, minuend.reg, 0, subtrahend.reg, 0, (aSize|0));
                diff.negative = false;
            } else {

                BigInteger.Subtract(diff.reg, 0, subtrahend.reg, 0, minuend.reg, 0, (aSize|0));
                diff.negative = true;
            }
        } else if (aSize > bSize) {

            var borrow = ((BigInteger.Subtract(diff.reg, 0, minuend.reg, 0, subtrahend.reg, 0, (bSize|0)))|0);
            for (var arrfillI = 0; arrfillI < aSize - bSize; arrfillI++) diff.reg[bSize + arrfillI] = minuend.reg[bSize + arrfillI];
            borrow = ((BigInteger.Decrement(diff.reg, bSize, ((aSize - bSize)|0), borrow))|0);

            diff.negative = false;
        } else {

            var borrow = ((BigInteger.Subtract(diff.reg, 0, subtrahend.reg, 0, minuend.reg, 0, (aSize|0)))|0);
            for (var arrfillI = 0; arrfillI < bSize - aSize; arrfillI++) diff.reg[aSize + arrfillI] = subtrahend.reg[aSize + arrfillI];
            borrow = ((BigInteger.Decrement(diff.reg, aSize, ((bSize - aSize)|0), borrow))|0);

            diff.negative = true;
        }
        diff.wordCount = diff.CalcWordCount();
        diff.ShortenArray();
        if (diff.wordCount == 0) diff.negative = false;
    };

    prototype['equals'] = prototype.equals = function(obj) {
        var other = ((obj.constructor==BigInteger) ? obj : null);
        if (other == null) return false;
        return other.compareTo(this) == 0;
    };

    prototype['hashCode'] = prototype.hashCode = function() {
        var hashCodeValue = 0;
        {
            hashCodeValue = hashCodeValue + (1000000007 * this.signum());
            if (this.reg != null) {
                for (var i = 0; i < this.wordCount; i++) {
                    hashCodeValue = hashCodeValue + (1000000013 * this.reg[i]);
                }
            }
        }
        return hashCodeValue;
    };

    prototype['add'] = prototype.add = function(bigintAugend) {
        if ((bigintAugend) == null) throw new Error("bigintAugend");
        var sum;
        if (this.wordCount == 0) return bigintAugend;
        if (bigintAugend.wordCount == 0) return this;
        if (bigintAugend.wordCount == 1 && this.wordCount == 1) {
            if (this.negative == bigintAugend.negative) {
                var intSum = ((this.reg[0]) & 65535) + ((bigintAugend.reg[0]) & 65535);
                sum = new BigInteger();
                sum.reg = [0, 0];
                sum.reg[0] = (intSum & 65535);
                sum.reg[1] = ((intSum >> 16) & 65535);
                sum.wordCount = ((intSum >> 16) == 0) ? 1 : 2;
                sum.negative = this.negative;
                return sum;
            } else {
                var a = ((this.reg[0]) & 65535);
                var b = ((bigintAugend.reg[0]) & 65535);
                if (a == b) return BigInteger.ZERO;
                if (a > b) {
                    a -= b;
                    sum = new BigInteger();
                    sum.reg = [0, 0];
                    sum.reg[0] = (a & 65535);
                    sum.wordCount = 1;
                    sum.negative = this.negative;
                    return sum;
                } else {
                    b -= a;
                    sum = new BigInteger();
                    sum.reg = [0, 0];
                    sum.reg[0] = (b & 65535);
                    sum.wordCount = 1;
                    sum.negative = !this.negative;
                    return sum;
                }
            }
        }
        sum = new BigInteger().Allocate((this.reg.length > bigintAugend.reg.length ? this.reg.length : bigintAugend.reg.length)|0);
        if (this.signum() >= 0) {
            if (bigintAugend.signum() >= 0) BigInteger.PositiveAdd(sum, this, bigintAugend); else BigInteger.PositiveSubtract(sum, this, bigintAugend);
        } else {

            if (bigintAugend.signum() >= 0) {
                BigInteger.PositiveSubtract(sum, bigintAugend, this);
            } else {

                BigInteger.PositiveAdd(sum, this, bigintAugend);

                sum.negative = sum.signum() != 0;
            }
        }
        return sum;
    };

    prototype['subtract'] = prototype.subtract = function(subtrahend) {
        if ((subtrahend) == null) throw new Error("subtrahend");
        var diff = new BigInteger().Allocate((this.reg.length > subtrahend.reg.length ? this.reg.length : subtrahend.reg.length)|0);
        if (this.signum() >= 0) {
            if (subtrahend.signum() >= 0) BigInteger.PositiveSubtract(diff, this, subtrahend); else BigInteger.PositiveAdd(diff, this, subtrahend);
        } else {
            if (subtrahend.signum() >= 0) {
                BigInteger.PositiveAdd(diff, this, subtrahend);
                diff.negative = diff.signum() != 0;
            } else {
                BigInteger.PositiveSubtract(diff, subtrahend, this);
            }
        }
        return diff;
    };
    prototype['ShortenArray'] = prototype.ShortenArray = function() {
        if (this.reg.length > 32) {
            var newLength = BigInteger.RoundupSize(this.wordCount);
            if (newLength < this.reg.length && (this.reg.length - newLength) >= 16) {

                var newreg = [];
                for (var arrfillI = 0; arrfillI < newLength; arrfillI++) newreg[arrfillI] = 0;
                for (var arrfillI = 0; arrfillI < (newLength < this.reg.length ? newLength : this.reg.length); arrfillI++) newreg[0 + arrfillI] = this.reg[0 + arrfillI];
                this.reg = newreg;
            }
        }
    };
    constructor['PositiveMultiply'] = constructor.PositiveMultiply = function(product, bigintA, bigintB) {
        if (bigintA.wordCount == 1) {
            var wc = bigintB.wordCount;
            product.reg = [];
            for (var arrfillI = 0; arrfillI < BigInteger.RoundupSize(wc + 1); arrfillI++) product.reg[arrfillI] = 0;
            product.reg[wc] = ((BigInteger.LinearMultiply(product.reg, 0, bigintB.reg, 0, bigintA.reg[0], wc)) & 65535);
            product.negative = false;
            product.wordCount = product.CalcWordCount();
            return;
        } else if (bigintB.wordCount == 1) {
            var wc = bigintA.wordCount;
            product.reg = [];
            for (var arrfillI = 0; arrfillI < BigInteger.RoundupSize(wc + 1); arrfillI++) product.reg[arrfillI] = 0;
            product.reg[wc] = ((BigInteger.LinearMultiply(product.reg, 0, bigintA.reg, 0, bigintB.reg[0], wc)) & 65535);
            product.negative = false;
            product.wordCount = product.CalcWordCount();
            return;
        } else if (bigintA.equals(bigintB)) {
            var aSize = BigInteger.RoundupSize(bigintA.wordCount);
            product.reg = [];
            for (var arrfillI = 0; arrfillI < BigInteger.RoundupSize(aSize + aSize); arrfillI++) product.reg[arrfillI] = 0;
            product.negative = false;
            var workspace = [];
            for (var arrfillI = 0; arrfillI < aSize + aSize; arrfillI++) workspace[arrfillI] = 0;
            BigInteger.RecursiveSquare(product.reg, 0, workspace, 0, bigintA.reg, 0, aSize);
        } else {
            var aSize = BigInteger.RoundupSize(bigintA.wordCount);
            var bSize = BigInteger.RoundupSize(bigintB.wordCount);
            product.reg = [];
            for (var arrfillI = 0; arrfillI < BigInteger.RoundupSize(aSize + bSize); arrfillI++) product.reg[arrfillI] = 0;
            product.negative = false;
            var workspace = [];
            for (var arrfillI = 0; arrfillI < aSize + bSize; arrfillI++) workspace[arrfillI] = 0;
            BigInteger.AsymmetricMultiply(product.reg, 0, workspace, 0, bigintA.reg, 0, aSize, bigintB.reg, 0, bSize);
        }
        product.wordCount = product.CalcWordCount();
        product.ShortenArray();
    };

    prototype['multiply'] = prototype.multiply = function(bigintMult) {
        if ((bigintMult) == null) throw new Error("bigintMult");
        var product = new BigInteger();
        if (this.wordCount == 0 || bigintMult.wordCount == 0) return BigInteger.ZERO;
        if (this.wordCount == 1 && this.reg[0] == 1) return this.negative ? bigintMult.negate() : bigintMult;
        if (bigintMult.wordCount == 1 && bigintMult.reg[0] == 1) return bigintMult.negative ? this.negate() : this;
        BigInteger.PositiveMultiply(product, this, bigintMult);
        if ((this.negative) != (bigintMult.negative)) product.NegateInternal();
        return product;
    };
    constructor['BitsToWords'] = constructor.BitsToWords = function(bitCount) {
        return ((bitCount + 15) >> 4);
    };
    constructor['FastRemainder'] = constructor.FastRemainder = function(dividendReg, count, divisorSmall) {
        var i = count;
        var remainder = 0;
        while ((i--) > 0) {
            remainder = BigInteger.RemainderUnsigned(BigInteger.MakeUint(dividendReg[i], remainder), divisorSmall);
        }
        return remainder;
    };
    constructor['FastDivide'] = constructor.FastDivide = function(quotientReg, dividendReg, count, divisorSmall) {
        var i = count;
        var remainder = 0;
        var idivisor = (divisorSmall & 65535);
        var quo, rem;
        while ((i--) > 0) {
            var currentDividend = ((((dividendReg[i] & 65535) | ((remainder|0) << 16))|0));
            if ((currentDividend >> 31) == 0) {
                quo = ((currentDividend / idivisor)|0);
                quotientReg[i] = (quo & 65535);
                if (i > 0) {
                    rem = currentDividend - (idivisor * quo);
                    remainder = (rem|0);
                }
            } else {
                quotientReg[i] = ((BigInteger.DivideUnsigned(currentDividend, divisorSmall)) & 65535);
                if (i > 0) remainder = BigInteger.RemainderUnsigned(currentDividend, divisorSmall);
            }
        }
    };
    constructor['FastDivideAndRemainderEx'] = constructor.FastDivideAndRemainderEx = function(quotientReg, dividendReg, count, divisorSmall) {
        var i = count;
        var remainder = 0;
        var idivisor = (divisorSmall & 65535);
        var quo, rem;
        while ((i--) > 0) {
            var currentDividend = ((((dividendReg[i] & 65535) | ((remainder|0) << 16))|0));
            if ((currentDividend >> 31) == 0) {
                quo = ((currentDividend / idivisor)|0);
                quotientReg[i] = (quo & 65535);
                rem = currentDividend - (idivisor * quo);
                remainder = (rem|0);
            } else {
                quotientReg[i] = ((BigInteger.DivideUnsigned(currentDividend, divisorSmall)) & 65535);
                remainder = BigInteger.RemainderUnsigned(currentDividend, divisorSmall);
            }
        }
        return remainder;
    };
    constructor['FastDivideAndRemainder'] = constructor.FastDivideAndRemainder = function(quotientReg, count, divisorSmall) {
        var i = count;
        var remainder = 0;
        var quo, rem;
        var idivisor = (divisorSmall & 65535);
        while ((i--) > 0) {
            var currentDividend = ((((quotientReg[i] & 65535) | ((remainder|0) << 16))|0));
            if ((currentDividend >> 31) == 0) {
                quo = ((currentDividend / idivisor)|0);
                quotientReg[i] = (quo & 65535);
                rem = currentDividend - (idivisor * quo);
                remainder = (rem|0);
            } else {
                quotientReg[i] = ((BigInteger.DivideUnsigned(currentDividend, divisorSmall)) & 65535);
                remainder = BigInteger.RemainderUnsigned(currentDividend, divisorSmall);
            }
        }
        return remainder;
    };

    prototype['divide'] = prototype.divide = function(bigintDivisor) {
        if ((bigintDivisor) == null) throw new Error("bigintDivisor");
        var aSize = this.wordCount;
        var bSize = bigintDivisor.wordCount;
        if (bSize == 0) throw new Error();
        if (aSize < bSize) {

            return BigInteger.ZERO;
        }
        if (aSize <= 2 && bSize <= 2 && this.canFitInInt() && bigintDivisor.canFitInInt()) {
            var aSmall = this.intValue();
            var bSmall = bigintDivisor.intValue();
            if (aSmall != -2147483648 || bSmall != -1) {
                var result = ((aSmall / bSmall)|0);
                return new BigInteger().InitializeInt(result);
            }
        }
        var quotient;
        if (bSize == 1) {

            quotient = new BigInteger();
            quotient.reg = [];
            for (var arrfillI = 0; arrfillI < this.reg.length; arrfillI++) quotient.reg[arrfillI] = 0;
            quotient.wordCount = this.wordCount;
            quotient.negative = this.negative;
            BigInteger.FastDivide(quotient.reg, this.reg, aSize, bigintDivisor.reg[0]);
            while (quotient.wordCount != 0 && quotient.reg[quotient.wordCount - 1] == 0) quotient.wordCount--;
            if (quotient.wordCount != 0) {
                quotient.negative = this.negative ^ bigintDivisor.negative;
                return quotient;
            } else {
                return BigInteger.ZERO;
            }
        }
        quotient = new BigInteger();
        aSize = aSize + (aSize % 2);
        bSize = bSize + (bSize % 2);
        quotient.reg = [];
        for (var arrfillI = 0; arrfillI < BigInteger.RoundupSize((aSize - bSize + 2)|0); arrfillI++) quotient.reg[arrfillI] = 0;
        quotient.negative = false;
        var tempbuf = [];
        for (var arrfillI = 0; arrfillI < aSize + 3 * (bSize + 2); arrfillI++) tempbuf[arrfillI] = 0;
        BigInteger.Divide(null, 0, quotient.reg, 0, tempbuf, 0, this.reg, 0, aSize, bigintDivisor.reg, 0, bSize);
        quotient.wordCount = quotient.CalcWordCount();
        quotient.ShortenArray();
        if ((this.signum() < 0) ^ (bigintDivisor.signum() < 0)) {
            quotient.NegateInternal();
        }
        return quotient;
    };

    prototype['divideAndRemainder'] = prototype.divideAndRemainder = function(divisor) {
        if ((divisor) == null) throw new Error("divisor");
        var quotient;
        var aSize = this.wordCount;
        var bSize = divisor.wordCount;
        if (bSize == 0) throw new Error();
        if (aSize < bSize) {

            return [BigInteger.ZERO, this];
        }
        if (bSize == 1) {

            quotient = new BigInteger();
            quotient.reg = [];
            for (var arrfillI = 0; arrfillI < this.reg.length; arrfillI++) quotient.reg[arrfillI] = 0;
            quotient.wordCount = this.wordCount;
            quotient.negative = this.negative;
            var smallRemainder = ((BigInteger.FastDivideAndRemainderEx(quotient.reg, this.reg, aSize, divisor.reg[0])) & 65535);
            while (quotient.wordCount != 0 && quotient.reg[quotient.wordCount - 1] == 0) quotient.wordCount--;
            quotient.ShortenArray();
            if (quotient.wordCount != 0) {
                quotient.negative = this.negative ^ divisor.negative;
            } else {
                quotient = BigInteger.ZERO;
            }
            if (this.negative) smallRemainder = -smallRemainder;
            return [quotient, new BigInteger().InitializeInt(smallRemainder)];
        }
        var remainder = new BigInteger();
        quotient = new BigInteger();
        aSize = aSize + (aSize & 1);
        bSize = bSize + (bSize & 1);
        remainder.reg = [];
        for (var arrfillI = 0; arrfillI < BigInteger.RoundupSize(bSize|0); arrfillI++) remainder.reg[arrfillI] = 0;
        remainder.negative = false;
        quotient.reg = [];
        for (var arrfillI = 0; arrfillI < BigInteger.RoundupSize((aSize - bSize + 2)|0); arrfillI++) quotient.reg[arrfillI] = 0;
        quotient.negative = false;
        var tempbuf = [];
        for (var arrfillI = 0; arrfillI < aSize + 3 * (bSize + 2); arrfillI++) tempbuf[arrfillI] = 0;
        BigInteger.Divide(remainder.reg, 0, quotient.reg, 0, tempbuf, 0, this.reg, 0, aSize, divisor.reg, 0, bSize);
        remainder.wordCount = remainder.CalcWordCount();
        quotient.wordCount = quotient.CalcWordCount();

        remainder.ShortenArray();
        quotient.ShortenArray();
        if (this.signum() < 0) {
            quotient.NegateInternal();
            if (remainder.signum() != 0) {
                remainder.NegateInternal();
            }
        }
        if (divisor.signum() < 0) quotient.NegateInternal();
        return [quotient, remainder];
    };

    prototype['mod'] = prototype.mod = function(divisor) {
        if ((divisor) == null) throw new Error("divisor");
        if (divisor.signum() < 0) {
            throw new Error("Divisor is negative");
        }
        var rem = this.remainder(divisor);
        if (rem.signum() < 0) rem = divisor.subtract(rem);
        return rem;
    };

    prototype['remainder'] = prototype.remainder = function(divisor) {
        if (this.PositiveCompare(divisor) < 0) {
            if (divisor.signum() == 0) throw new Error();
            return this;
        }
        var remainder = new BigInteger();
        var aSize = this.wordCount;
        var bSize = divisor.wordCount;
        if (bSize == 0) throw new Error();
        if (aSize < bSize) {

            return this;
        }
        if (bSize == 1) {
            var shortRemainder = BigInteger.FastRemainder(this.reg, this.wordCount, divisor.reg[0]);
            var smallRemainder = (shortRemainder & 65535);
            if (this.signum() < 0) smallRemainder = -smallRemainder;
            return new BigInteger().InitializeInt(smallRemainder);
        }
        aSize = aSize + (aSize % 2);
        bSize = bSize + (bSize % 2);
        remainder.reg = [];
        for (var arrfillI = 0; arrfillI < BigInteger.RoundupSize(bSize|0); arrfillI++) remainder.reg[arrfillI] = 0;
        remainder.negative = false;
        var tempbuf = [];
        for (var arrfillI = 0; arrfillI < aSize + 3 * (bSize + 2); arrfillI++) tempbuf[arrfillI] = 0;
        BigInteger.Divide(remainder.reg, 0, null, 0, tempbuf, 0, this.reg, 0, aSize, divisor.reg, 0, bSize);
        remainder.wordCount = remainder.CalcWordCount();
        remainder.ShortenArray();
        if (this.signum() < 0 && remainder.signum() != 0) {
            remainder.NegateInternal();
        }
        return remainder;
    };
    prototype['NegateInternal'] = prototype.NegateInternal = function() {
        if (this.wordCount != 0) this.negative = (this.signum() > 0);
    };
    prototype['PositiveCompare'] = prototype.PositiveCompare = function(t) {
        var size = this.wordCount, tSize = t.wordCount;
        if (size == tSize) return BigInteger.Compare(this.reg, 0, t.reg, 0, (size|0)); else return size > tSize ? 1 : -1;
    };

    prototype['compareTo'] = prototype.compareTo = function(other) {
        if (other == null) return 1;
        if (this == other) return 0;
        var size = this.wordCount, tSize = other.wordCount;
        var sa = (size == 0 ? 0 : (this.negative ? -1 : 1));
        var sb = (tSize == 0 ? 0 : (other.negative ? -1 : 1));
        if (sa != sb) return (sa < sb) ? -1 : 1;
        if (sa == 0) return 0;
        var cmp = 0;
        if (size == tSize) {
            if (size == 1 && this.reg[0] == other.reg[0]) {
                return 0;
            } else {
                cmp = BigInteger.Compare(this.reg, 0, other.reg, 0, (size|0));
            }
        } else {
            cmp = size > tSize ? 1 : -1;
        }
        return (sa > 0) ? cmp : -cmp;
    };

    prototype['signum'] = prototype.signum = function() {
        if (this.wordCount == 0) return 0;
        return (this.negative) ? -1 : 1;
    };

    prototype['isZero'] = prototype.isZero = function() {
        return (this.wordCount == 0);
    };

    prototype['sqrt'] = prototype.sqrt = function() {
        if (this.signum() <= 0) return BigInteger.ZERO;
        var bigintX = null;
        var bigintY = BigInteger.Power2((((this.getUnsignedBitLength() + 1) / 2)|0));
        do {
            bigintX = bigintY;
            bigintY = this.divide(bigintX);
            bigintY = bigintY.add(bigintX);
            bigintY = bigintY.shiftRight(1);
        } while (bigintY.compareTo(bigintX) < 0);
        return bigintX;
    };

    prototype['isEven'] = prototype.isEven = function() {
        return !this.GetUnsignedBit(0);
    };
    constructor['ZERO'] = constructor.ZERO = new BigInteger().InitializeInt(0);
    constructor['ONE'] = constructor.ONE = new BigInteger().InitializeInt(1);
    constructor['TEN'] = constructor.TEN = new BigInteger().InitializeInt(10);
})(BigInteger,BigInteger.prototype);

if(typeof exports!=="undefined")exports['BigInteger']=BigInteger;
if(typeof window!=="undefined")window['BigInteger']=BigInteger;

var FastInteger =

function(value) {

    this.smallValue = value;
};
(function(constructor,prototype){
    constructor.MutableNumber = function FastInteger$MutableNumber(val) {

        if (val < 0) throw new Error("Only positive integers are supported");
        this.data = [0, 0, 0, 0];
        this.wordCount = (val == 0) ? 0 : 1;
        this.data[0] = (((val) & 0xFFFFFFFF)|0);
    };
    (function(constructor,prototype){
        prototype.data = null;
        prototype.wordCount = null;
        constructor.FromBigInteger = function(bigintVal) {
            var mnum = new FastInteger.MutableNumber(0);
            if (bigintVal.signum() < 0) throw new Error("Only positive integers are supported");
            var bytes = bigintVal.toByteArray(true);
            var len = bytes.length;
            var newWordCount = (4 > ((len / 4)|0) + 1 ? 4 : ((len / 4)|0) + 1);
            if (newWordCount > mnum.data.length) {
                mnum.data = [];
                for (var arrfillI = 0; arrfillI < newWordCount; arrfillI++) mnum.data[arrfillI] = 0;
            }
            mnum.wordCount = newWordCount;
            {
                for (var i = 0; i < len; i += 4) {
                    var x = ((bytes[i])|0) & 255;
                    if (i + 1 < len) {
                        x |= (bytes[i + 1] & 255) << 8;
                    }
                    if (i + 2 < len) {
                        x |= (bytes[i + 2] & 255) << 16;
                    }
                    if (i + 3 < len) {
                        x |= (bytes[i + 3] & 255) << 24;
                    }
                    mnum.data[i >> 2] = x;
                }
            }
            while (mnum.wordCount != 0 && mnum.data[mnum.wordCount - 1] == 0) mnum.wordCount--;
            return mnum;
        };
        prototype.SetInt = function(val) {
            if (val < 0) throw new Error("Only positive integers are supported");
            this.wordCount = (val == 0) ? 0 : 1;
            this.data[0] = (((val) & 0xFFFFFFFF)|0);
            return this;
        };
        prototype.ToBigInteger = function() {
            if (this.wordCount == 1 && (this.data[0] >> 31) == 0) {
                return BigInteger.valueOf((this.data[0])|0);
            }
            var bytes = [];
            for (var arrfillI = 0; arrfillI < this.wordCount * 4 + 1; arrfillI++) bytes[arrfillI] = 0;
            for (var i = 0; i < this.wordCount; i++) {
                bytes[i * 4 + 0] = ((this.data[i]) & 255);
                bytes[i * 4 + 1] = ((this.data[i] >> 8) & 255);
                bytes[i * 4 + 2] = ((this.data[i] >> 16) & 255);
                bytes[i * 4 + 3] = ((this.data[i] >> 24) & 255);
            }
            bytes[bytes.length - 1] = 0;
            return BigInteger.fromByteArray(bytes, true);
        };
        prototype.GetLastWordsInternal = function(numWords32Bit) {
            var ret = [];
            for (var arrfillI = 0; arrfillI < numWords32Bit; arrfillI++) ret[arrfillI] = 0;
            for (var arrfillI = 0; arrfillI < (numWords32Bit < this.wordCount ? numWords32Bit : this.wordCount); arrfillI++) ret[0 + arrfillI] = this.data[0 + arrfillI];
            return ret;
        };
        prototype.CanFitInInt32 = function() {
            return this.wordCount == 0 || (this.wordCount == 1 && (this.data[0] >> 31) == 0);
        };
        prototype.ToInt32 = function() {
            return this.wordCount == 0 ? 0 : this.data[0];
        };
        prototype.Copy = function() {
            var mbi = new FastInteger.MutableNumber(0);
            if (this.wordCount > mbi.data.length) {
                mbi.data = [];
                for (var arrfillI = 0; arrfillI < this.wordCount; arrfillI++) mbi.data[arrfillI] = 0;
            }
            for (var arrfillI = 0; arrfillI < this.wordCount; arrfillI++) mbi.data[0 + arrfillI] = this.data[0 + arrfillI];
            mbi.wordCount = this.wordCount;
            return mbi;
        };
        prototype.MultiplyByTenAndAdd = function(digit) {
            if (digit < 0 || digit >= 10) throw new Error("Only digits 0 to 9 are supported");
            var s;
            var d;
            digit &= 65535;
            var carry = 0;
            if (this.wordCount == 0) {
                if (this.data.length == 0) this.data = [0, 0, 0, 0];
                this.data[0] = 0;
                this.wordCount = 1;
            }
            {
                for (var i = 0; i < this.wordCount; i++) {
                    var B0 = this.data[i];
                    var B1 = B0;
                    B0 &= (65535);
                    B1 = (B1 >>> 16);
                    if (B0 > B1) {
                        s = (((B0|0) - B1) & 65535);
                        d = 65526 * s;
                    } else {
                        s = 0;
                        d = 10 * (((B1|0) - B0) & 65535);
                    }
                    var A0B0 = 10 * B0;
                    var a0b0high = (A0B0 >>> 16);
                    var tempInt;
                    tempInt = A0B0 + carry;
                    if (i == 0) tempInt += digit;
                    var result0 = (tempInt & 65535);
                    tempInt = ((tempInt >> 16) & 65535) + (A0B0 & 65535) + (d & 65535);
                    var result1 = (tempInt & 65535);
                    tempInt = ((tempInt >> 16) & 65535) + a0b0high + ((d >> 16) & 65535) - s;
                    this.data[i] = ((result0 | (result1 << 16))|0);
                    carry = (tempInt & 65535);
                }
            }
            if (carry != 0) {
                if (this.wordCount >= this.data.length) {
                    var newdata = [];
                    for (var arrfillI = 0; arrfillI < this.wordCount + 20; arrfillI++) newdata[arrfillI] = 0;
                    for (var arrfillI = 0; arrfillI < this.data.length; arrfillI++) newdata[0 + arrfillI] = this.data[0 + arrfillI];
                    this.data = newdata;
                }
                this.data[this.wordCount] = carry;
                this.wordCount++;
            }
            while (this.wordCount != 0 && this.data[this.wordCount - 1] == 0) this.wordCount--;
            return this;
        };
        prototype.Multiply = function(multiplicand) {
            if (multiplicand < 0) throw new Error("Only positive multiplicands are supported"); else if (multiplicand != 0) {
                var carry = 0;
                if (this.wordCount == 0) {
                    if (this.data.length == 0) this.data = [0, 0, 0, 0];
                    this.data[0] = 0;
                    this.wordCount = 1;
                }
                var result0, result1, result2, result3;
                if (multiplicand < 65536) {
                    for (var i = 0; i < this.wordCount; i++) {
                        var x0 = this.data[i];
                        var x1 = x0;
                        var y0 = multiplicand;
                        x0 &= (65535);
                        x1 = (x1 >>> 16);
                        var temp = (x0 * y0);
                        result1 = (temp >>> 16);
                        result0 = temp & 65535;
                        result2 = 0;
                        temp = (x1 * y0);
                        result2 = result2 + (temp >>> 16);
                        result1 += temp & 65535;
                        result2 = result2 + (result1 >>> 16);
                        result1 = result1 & 65535;
                        result3 = (result2 >>> 16);
                        result2 = result2 & 65535;
                        x0 = ((result0 | (result1 << 16))|0);
                        x1 = ((result2 | (result3 << 16))|0);
                        var x2 = (x0 + carry);
                        if (((x2 >> 31) == (x0 >> 31)) ? ((x2 & 2147483647) < (x0 & 2147483647)) : ((x2 >> 31) == 0)) {
                            x1 = (x1 + 1);
                        }
                        this.data[i] = x2;
                        carry = x1;
                    }
                } else {
                    for (var i = 0; i < this.wordCount; i++) {
                        var x0 = this.data[i];
                        var x1 = x0;
                        var y0 = multiplicand;
                        var y1 = y0;
                        x0 &= (65535);
                        y0 &= (65535);
                        x1 = (x1 >>> 16);
                        y1 = (y1 >>> 16);
                        var temp = (x0 * y0);
                        result1 = (temp >>> 16);
                        result0 = temp & 65535;
                        temp = (x0 * y1);
                        result2 = (temp >>> 16);
                        result1 += temp & 65535;
                        result2 = result2 + (result1 >>> 16);
                        result1 = result1 & 65535;
                        temp = (x1 * y0);
                        result2 = result2 + (temp >>> 16);
                        result1 += temp & 65535;
                        result2 = result2 + (result1 >>> 16);
                        result1 = result1 & 65535;
                        result3 = (result2 >>> 16);
                        result2 = result2 & 65535;
                        temp = (x1 * y1);
                        result3 = result3 + (temp >>> 16);
                        result2 += temp & 65535;
                        result3 = result3 + (result2 >>> 16);
                        result2 = result2 & 65535;
                        x0 = ((result0 | (result1 << 16))|0);
                        x1 = ((result2 | (result3 << 16))|0);
                        var x2 = (x0 + carry);
                        if (((x2 >> 31) == (x0 >> 31)) ? ((x2 & 2147483647) < (x0 & 2147483647)) : ((x2 >> 31) == 0)) {
                            x1 = (x1 + 1);
                        }
                        this.data[i] = x2;
                        carry = x1;
                    }
                }
                if (carry != 0) {
                    if (this.wordCount >= this.data.length) {
                        var newdata = [];
                        for (var arrfillI = 0; arrfillI < this.wordCount + 20; arrfillI++) newdata[arrfillI] = 0;
                        for (var arrfillI = 0; arrfillI < this.data.length; arrfillI++) newdata[0 + arrfillI] = this.data[0 + arrfillI];
                        this.data = newdata;
                    }
                    this.data[this.wordCount] = carry;
                    this.wordCount++;
                }
                while (this.wordCount != 0 && this.data[this.wordCount - 1] == 0) this.wordCount--;
            } else {
                if (this.data.length > 0) this.data[0] = 0;
                this.wordCount = 0;
            }
            return this;
        };
        prototype.signum = function() {
            return (this.wordCount == 0 ? 0 : 1);
        };
        prototype.isEvenNumber = function() {
            return (this.wordCount == 0 || (this.data[0] & 1) == 0);
        };
        prototype.CompareToInt = function(val) {
            if (val < 0 || this.wordCount > 1) return 1;
            if (this.wordCount == 0) {
                return (val == 0) ? 0 : -1;
            } else if (this.data[0] == val) {
                return 0;
            } else {
                return (((this.data[0] >> 31) == (val >> 31)) ? ((this.data[0] & 2147483647) < (val & 2147483647)) : ((this.data[0] >> 31) == 0)) ? -1 : 1;
            }
        };
        prototype.SubtractInt = function(other) {
            if (other < 0) throw new Error("Only positive values are supported"); else if (other != 0) {
                {
                    if (this.wordCount == 0) {
                        if (this.data.length == 0) this.data = [0, 0, 0, 0];
                        this.data[0] = 0;
                        this.wordCount = 1;
                    }
                    var borrow;
                    var u;
                    var a = this.data[0];
                    u = (a - other);
                    borrow = ((((a >> 31) == (u >> 31)) ? ((a & 2147483647) < (u & 2147483647)) : ((a >> 31) == 0)) || (a == u && other != 0)) ? 1 : 0;
                    this.data[0] = (u|0);
                    if (borrow != 0) {
                        for (var i = 1; i < this.wordCount; i++) {
                            u = (this.data[i]) - borrow;
                            borrow = ((((this.data[i] >> 31) == (u >> 31)) ? ((this.data[i] & 2147483647) < (u & 2147483647)) : ((this.data[i] >> 31) == 0))) ? 1 : 0;
                            this.data[i] = (u|0);
                        }
                    }
                    while (this.wordCount != 0 && this.data[this.wordCount - 1] == 0) this.wordCount--;
                }
            }
            return this;
        };
        prototype.Subtract = function(other) {
            {
                {
                    var neededSize = (this.wordCount > other.wordCount) ? this.wordCount : other.wordCount;
                    if (this.data.length < neededSize) {
                        var newdata = [];
                        for (var arrfillI = 0; arrfillI < neededSize + 20; arrfillI++) newdata[arrfillI] = 0;
                        for (var arrfillI = 0; arrfillI < this.data.length; arrfillI++) newdata[0 + arrfillI] = this.data[0 + arrfillI];
                        this.data = newdata;
                    }
                    neededSize = (this.wordCount < other.wordCount) ? this.wordCount : other.wordCount;
                    var u = 0;
                    var borrow = 0;
                    for (var i = 0; i < neededSize; i++) {
                        var a = this.data[i];
                        u = (a - other.data[i]) - borrow;
                        borrow = ((((a >> 31) == (u >> 31)) ? ((a & 2147483647) < (u & 2147483647)) : ((a >> 31) == 0)) || (a == u && other.data[i] != 0)) ? 1 : 0;
                        this.data[i] = (u|0);
                    }
                    if (borrow != 0) {
                        for (var i = neededSize; i < this.wordCount; i++) {
                            var a = this.data[i];
                            u = (a - other.data[i]) - borrow;
                            borrow = ((((a >> 31) == (u >> 31)) ? ((a & 2147483647) < (u & 2147483647)) : ((a >> 31) == 0)) || (a == u && other.data[i] != 0)) ? 1 : 0;
                            this.data[i] = (u|0);
                        }
                    }
                    while (this.wordCount != 0 && this.data[this.wordCount - 1] == 0) this.wordCount--;
                    return this;
                }
            }
        };
        prototype.compareTo = function(other) {
            if (this.wordCount != other.wordCount) {
                return (this.wordCount < other.wordCount) ? -1 : 1;
            }
            var N = this.wordCount;
            while ((N--) != 0) {
                var an = this.data[N];
                var bn = other.data[N];
                if (((an >> 31) == (bn >> 31)) ? ((an & 2147483647) < (bn & 2147483647)) : ((an >> 31) == 0)) {
                    return -1;
                } else if (an != bn) {
                    return 1;
                }
            }
            return 0;
        };
        prototype.Add = function(augend) {
            if (augend < 0) throw new Error("Only positive augends are supported"); else if (augend != 0) {
                var carry = 0;
                if (this.wordCount == 0) {
                    if (this.data.length == 0) this.data = [0, 0, 0, 0];
                    this.data[0] = 0;
                    this.wordCount = 1;
                }
                for (var i = 0; i < this.wordCount; i++) {
                    var u;
                    var a = this.data[i];
                    u = (a + augend) + carry;
                    carry = ((((u >> 31) == (a >> 31)) ? ((u & 2147483647) < (a & 2147483647)) : ((u >> 31) == 0)) || (u == a && augend != 0)) ? 1 : 0;
                    this.data[i] = u;
                    if (carry == 0) return this;
                    augend = 0;
                }
                if (carry != 0) {
                    if (this.wordCount >= this.data.length) {
                        var newdata = [];
                        for (var arrfillI = 0; arrfillI < this.wordCount + 20; arrfillI++) newdata[arrfillI] = 0;
                        for (var arrfillI = 0; arrfillI < this.data.length; arrfillI++) newdata[0 + arrfillI] = this.data[0 + arrfillI];
                        this.data = newdata;
                    }
                    this.data[this.wordCount] = carry;
                    this.wordCount++;
                }
            }
            while (this.wordCount != 0 && this.data[this.wordCount - 1] == 0) this.wordCount--;
            return this;
        };
    })(FastInteger.MutableNumber,FastInteger.MutableNumber.prototype);

    prototype.smallValue = null;
    prototype.mnum = null;
    prototype.largeValue = null;
    prototype.integerMode = 0;
    constructor.Int32MinValue = BigInteger.valueOf(-2147483648);
    constructor.Int32MaxValue = BigInteger.valueOf(2147483647);
    constructor.NegativeInt32MinValue = (FastInteger.Int32MinValue).negate();
    constructor.Copy = function(value) {
        var fi = new FastInteger(value.smallValue);
        fi.integerMode = value.integerMode;
        fi.largeValue = value.largeValue;
        fi.mnum = (value.mnum == null || value.integerMode != 1) ? null : value.mnum.Copy();
        return fi;
    };
    constructor.FromBig = function(bigintVal) {
        if (bigintVal.canFitInInt()) {
            return new FastInteger(bigintVal.intValue());
        } else if (bigintVal.signum() > 0) {
            var fi = new FastInteger(0);
            fi.integerMode = 1;
            fi.mnum = FastInteger.MutableNumber.FromBigInteger(bigintVal);
            return fi;
        } else {
            var fi = new FastInteger(0);
            fi.integerMode = 2;
            fi.largeValue = bigintVal;
            return fi;
        }
    };

    prototype.AsInt32 = function() {
        switch(this.integerMode) {
            case 0:
                return this.smallValue;
            case 1:
                return this.mnum.ToInt32();
            case 2:
                return this.largeValue.intValue();
            default:
                throw new Error();
        }
    };

    prototype.compareTo = function(val) {
        switch((this.integerMode << 2) | val.integerMode) {
            case ((0 << 2) | 0):
                {
                    var vsv = val.smallValue;
                    return (this.smallValue == vsv) ? 0 : (this.smallValue < vsv ? -1 : 1);
                }
            case ((0 << 2) | 1):
                return -(val.mnum.CompareToInt(this.smallValue));
            case ((0 << 2) | 2):
                return this.AsBigInteger().compareTo(val.largeValue);
            case ((1 << 2) | 0):
                return this.mnum.CompareToInt(val.smallValue);
            case ((1 << 2) | 1):
                return this.mnum.compareTo(val.mnum);
            case ((1 << 2) | 2):
                return this.AsBigInteger().compareTo(val.largeValue);
            case ((2 << 2) | 0):
            case ((2 << 2) | 1):
            case ((2 << 2) | 2):
                return this.largeValue.compareTo(val.AsBigInteger());
            default:
                throw new Error();
        }
    };

    prototype.Abs = function() {
        return (this.signum() < 0) ? this.Negate() : this;
    };
    constructor.WordsToBigInteger = function(words) {
        var wordCount = words.length;
        if (wordCount == 1 && (words[0] >> 31) == 0) {
            return BigInteger.valueOf((words[0])|0);
        }
        var bytes = [];
        for (var arrfillI = 0; arrfillI < wordCount * 4 + 1; arrfillI++) bytes[arrfillI] = 0;
        for (var i = 0; i < wordCount; i++) {
            bytes[i * 4 + 0] = (words[i] & 255);
            bytes[i * 4 + 1] = ((words[i] >> 8) & 255);
            bytes[i * 4 + 2] = ((words[i] >> 16) & 255);
            bytes[i * 4 + 3] = ((words[i] >> 24) & 255);
        }
        bytes[bytes.length - 1] = 0;
        return BigInteger.fromByteArray(bytes, true);
    };
    constructor.GetLastWords = function(bigint, numWords32Bit) {
        return FastInteger.MutableNumber.FromBigInteger(bigint).GetLastWordsInternal(numWords32Bit);
    };

    prototype.SetInt = function(val) {
        this.smallValue = val;
        this.integerMode = 0;
        return this;
    };

    prototype.MultiplyByTenAndAdd = function(digit) {
        if (this.integerMode == 1) {
            this.mnum.MultiplyByTenAndAdd(digit);
            return this;
        }
        if (digit > 0) {
            if (this.integerMode == 0 && this.smallValue >= 214748363) {
                this.integerMode = 1;
                this.mnum = new FastInteger.MutableNumber(this.smallValue);
                this.mnum.MultiplyByTenAndAdd(digit);
                return this;
            }
        }
        return this.Multiply(10).AddInt(digit);
    };

    prototype.RepeatedSubtract = function(divisor) {
        if (this.integerMode == 1) {
            var count = 0;
            if (divisor.integerMode == 1) {
                while (this.mnum.compareTo(divisor.mnum) >= 0) {
                    this.mnum.Subtract(divisor.mnum);
                    count++;
                }
                return count;
            } else if (divisor.integerMode == 0 && divisor.smallValue >= 0) {
                if (this.mnum.CanFitInInt32()) {
                    var small = this.mnum.ToInt32();
                    count = ((small / divisor.smallValue)|0);
                    this.mnum.SetInt(small % divisor.smallValue);
                } else {
                    var dmnum = new FastInteger.MutableNumber(divisor.smallValue);
                    while (this.mnum.compareTo(dmnum) >= 0) {
                        this.mnum.Subtract(dmnum);
                        count++;
                    }
                }
                return count;
            } else {
                var bigrem;
                var bigquo;
                {
                    var divrem = (this.AsBigInteger()).divideAndRemainder(divisor.AsBigInteger());
                    bigquo = divrem[0];
                    bigrem = divrem[1];
                }
                var smallquo = bigquo.intValue();
                this.integerMode = 2;
                this.largeValue = bigrem;
                return smallquo;
            }
        } else {
            var bigrem;
            var bigquo;
            {
                var divrem = (this.AsBigInteger()).divideAndRemainder(divisor.AsBigInteger());
                bigquo = divrem[0];
                bigrem = divrem[1];
            }
            var smallquo = bigquo.intValue();
            this.integerMode = 2;
            this.largeValue = bigrem;
            return smallquo;
        }
    };

    prototype.Multiply = function(val) {
        if (val == 0) {
            this.smallValue = 0;
            this.integerMode = 0;
        } else {
            switch(this.integerMode) {
                case 0:
                    var apos = (this.smallValue > 0);
                    var bpos = (val > 0);
                    if ((apos && ((!bpos && ((-2147483648 / this.smallValue)|0) > val) || (bpos && this.smallValue > ((2147483647 / val)|0)))) || (!apos && ((!bpos && this.smallValue != 0 && ((2147483647 / this.smallValue)|0) > val) || (bpos && this.smallValue < ((-2147483648 / val)|0))))) {

                        if (apos && bpos) {

                            this.integerMode = 1;
                            this.mnum = new FastInteger.MutableNumber(this.smallValue);
                            this.mnum.Multiply(val);
                        } else {

                            this.integerMode = 2;
                            this.largeValue = BigInteger.valueOf(this.smallValue);
                            this.largeValue = this.largeValue.multiply(BigInteger.valueOf(val));
                        }
                    } else {
                        this.smallValue *= (val|0);
                    }
                    break;
                case 1:
                    if (val < 0) {
                        this.integerMode = 2;
                        this.largeValue = this.mnum.ToBigInteger();
                        this.largeValue = this.largeValue.multiply(BigInteger.valueOf(val));
                    } else {
                        this.mnum.Multiply(val);
                    }
                    break;
                case 2:
                    this.largeValue = this.largeValue.multiply(BigInteger.valueOf(val));
                    break;
                default:
                    throw new Error();
            }
        }
        return this;
    };

    prototype.Negate = function() {
        switch(this.integerMode) {
            case 0:
                if (this.smallValue == -2147483648) {

                    this.integerMode = 1;
                    this.mnum = FastInteger.MutableNumber.FromBigInteger(FastInteger.NegativeInt32MinValue);
                } else {
                    this.smallValue = -this.smallValue;
                }
                break;
            case 1:
                this.integerMode = 2;
                this.largeValue = this.mnum.ToBigInteger();
                this.largeValue = (this.largeValue).negate();
                break;
            case 2:
                this.largeValue = (this.largeValue).negate();
                break;
            default:
                throw new Error();
        }
        return this;
    };

    prototype.Subtract = function(val) {
        var valValue;
        switch(this.integerMode) {
            case 0:
                if (val.integerMode == 0) {
                    var vsv = val.smallValue;
                    if ((vsv < 0 && 2147483647 + vsv < this.smallValue) || (vsv > 0 && -2147483648 + vsv > this.smallValue)) {

                        this.integerMode = 2;
                        this.largeValue = BigInteger.valueOf(this.smallValue);
                        this.largeValue = this.largeValue.subtract(BigInteger.valueOf(vsv));
                    } else {
                        this.smallValue -= vsv;
                    }
                } else {
                    this.integerMode = 2;
                    this.largeValue = BigInteger.valueOf(this.smallValue);
                    valValue = val.AsBigInteger();
                    this.largeValue = this.largeValue.subtract(valValue);
                }
                break;
            case 1:
                if (val.integerMode == 1) {

                    this.mnum.Subtract(val.mnum);
                } else if (val.integerMode == 0 && val.smallValue >= 0) {
                    this.mnum.SubtractInt(val.smallValue);
                } else {
                    this.integerMode = 2;
                    this.largeValue = this.mnum.ToBigInteger();
                    valValue = val.AsBigInteger();
                    this.largeValue = this.largeValue.subtract(valValue);
                }
                break;
            case 2:
                valValue = val.AsBigInteger();
                this.largeValue = this.largeValue.subtract(valValue);
                break;
            default:
                throw new Error();
        }
        return this;
    };

    prototype.SubtractInt = function(val) {
        if (val == -2147483648) {
            return this.AddBig(FastInteger.NegativeInt32MinValue);
        } else if (this.integerMode == 0) {
            if ((val < 0 && 2147483647 + val < this.smallValue) || (val > 0 && -2147483648 + val > this.smallValue)) {

                this.integerMode = 2;
                this.largeValue = BigInteger.valueOf(this.smallValue);
                this.largeValue = this.largeValue.subtract(BigInteger.valueOf(val));
            } else {
                this.smallValue -= val;
            }
            return this;
        } else {
            return this.AddInt(-val);
        }
    };

    prototype.AddBig = function(bigintVal) {
        switch(this.integerMode) {
            case 0:
                {
                    var sign = bigintVal.signum();
                    if (bigintVal.canFitInInt()) {
                        return this.AddInt(bigintVal.intValue());
                    }
                    return this.Add(FastInteger.FromBig(bigintVal));
                }
            case 1:
                this.integerMode = 2;
                this.largeValue = this.mnum.ToBigInteger();
                this.largeValue = this.largeValue.add(bigintVal);
                break;
            case 2:
                this.largeValue = this.largeValue.add(bigintVal);
                break;
            default:
                throw new Error();
        }
        return this;
    };

    prototype.SubtractBig = function(bigintVal) {
        if (this.integerMode == 2) {
            this.largeValue = this.largeValue.subtract(bigintVal);
            return this;
        } else {
            var sign = bigintVal.signum();
            if (sign == 0) return this;

            if (sign < 0 && bigintVal.compareTo(FastInteger.Int32MinValue) > 0) {
                return this.AddInt(-(bigintVal.intValue()));
            }
            if (sign > 0 && bigintVal.compareTo(FastInteger.Int32MaxValue) <= 0) {
                return this.SubtractInt(bigintVal.intValue());
            }
            bigintVal = bigintVal.negate();
            return this.AddBig(bigintVal);
        }
    };

    prototype.Add = function(val) {
        var valValue;
        switch(this.integerMode) {
            case 0:
                if (val.integerMode == 0) {
                    if ((this.smallValue < 0 && ((val.smallValue)|0) < -2147483648 - this.smallValue) || (this.smallValue > 0 && ((val.smallValue)|0) > 2147483647 - this.smallValue)) {

                        if (val.smallValue >= 0) {
                            this.integerMode = 1;
                            this.mnum = new FastInteger.MutableNumber(this.smallValue);
                            this.mnum.Add(val.smallValue);
                        } else {
                            this.integerMode = 2;
                            this.largeValue = BigInteger.valueOf(this.smallValue);
                            this.largeValue = this.largeValue.add(BigInteger.valueOf(val.smallValue));
                        }
                    } else {
                        this.smallValue = this.smallValue + (val.smallValue);
                    }
                } else {
                    this.integerMode = 2;
                    this.largeValue = BigInteger.valueOf(this.smallValue);
                    valValue = val.AsBigInteger();
                    this.largeValue = this.largeValue.add(valValue);
                }
                break;
            case 1:
                if (val.integerMode == 0 && val.smallValue >= 0) {
                    this.mnum.Add(val.smallValue);
                } else {
                    this.integerMode = 2;
                    this.largeValue = this.mnum.ToBigInteger();
                    valValue = val.AsBigInteger();
                    this.largeValue = this.largeValue.add(valValue);
                }
                break;
            case 2:
                valValue = val.AsBigInteger();
                this.largeValue = this.largeValue.add(valValue);
                break;
            default:
                throw new Error();
        }
        return this;
    };

    prototype.Mod = function(divisor) {

        if (divisor != 0) {
            switch(this.integerMode) {
                case 0:
                    this.smallValue %= divisor;
                    break;
                case 1:
                    this.largeValue = this.mnum.ToBigInteger();
                    this.largeValue = this.largeValue.remainder(BigInteger.valueOf(divisor));
                    this.smallValue = this.largeValue.intValue();
                    this.integerMode = 0;
                    break;
                case 2:
                    this.largeValue = this.largeValue.remainder(BigInteger.valueOf(divisor));
                    this.smallValue = this.largeValue.intValue();
                    this.integerMode = 0;
                    break;
                default:
                    throw new Error();
            }
        } else {
            throw new Error();
        }
        return this;
    };

    prototype.Increment = function() {
        if (this.integerMode == 0) {
            if (this.smallValue != 2147483647) {
                this.smallValue++;
            } else {
                this.integerMode = 1;
                this.mnum = FastInteger.MutableNumber.FromBigInteger(FastInteger.NegativeInt32MinValue);
            }
            return this;
        } else {
            return this.AddInt(1);
        }
    };

    prototype.Decrement = function() {
        if (this.integerMode == 0) {
            if (this.smallValue != -2147483648) {
                this.smallValue--;
            } else {
                this.integerMode = 1;
                this.mnum = FastInteger.MutableNumber.FromBigInteger(FastInteger.Int32MinValue);
                this.mnum.SubtractInt(1);
            }
            return this;
        } else {
            return this.SubtractInt(1);
        }
    };

    prototype.Divide = function(divisor) {
        if (divisor != 0) {
            switch(this.integerMode) {
                case 0:
                    if (divisor == -1 && this.smallValue == -2147483648) {

                        this.integerMode = 1;
                        this.mnum = FastInteger.MutableNumber.FromBigInteger(FastInteger.NegativeInt32MinValue);
                    } else {
                        this.smallValue = ((this.smallValue / divisor)|0);
                    }
                    break;
                case 1:
                    this.integerMode = 2;
                    this.largeValue = this.mnum.ToBigInteger();
                    this.largeValue = this.largeValue.divide(BigInteger.valueOf(divisor));
                    if (this.largeValue.signum() == 0) {
                        this.integerMode = 0;
                        this.smallValue = 0;
                    }
                    break;
                case 2:
                    this.largeValue = this.largeValue.divide(BigInteger.valueOf(divisor));
                    if (this.largeValue.signum() == 0) {
                        this.integerMode = 0;
                        this.smallValue = 0;
                    }
                    break;
                default:
                    throw new Error();
            }
        } else {
            throw new Error();
        }
        return this;
    };

    prototype.isEvenNumber = function() {
        switch(this.integerMode) {
            case 0:
                return (this.smallValue & 1) == 0;
            case 1:
                return this.mnum.isEvenNumber();
            case 2:
                return this.largeValue.testBit(0) == false;
            default:
                throw new Error();
        }
    };

    prototype.AddInt = function(val) {
        var valValue;
        switch(this.integerMode) {
            case 0:
                if ((this.smallValue < 0 && (val|0) < -2147483648 - this.smallValue) || (this.smallValue > 0 && (val|0) > 2147483647 - this.smallValue)) {

                    if (val >= 0) {
                        this.integerMode = 1;
                        this.mnum = new FastInteger.MutableNumber(this.smallValue);
                        this.mnum.Add(val);
                    } else {
                        this.integerMode = 2;
                        this.largeValue = BigInteger.valueOf(this.smallValue);
                        this.largeValue = this.largeValue.add(BigInteger.valueOf(val));
                    }
                } else {
                    this.smallValue = this.smallValue + (val);
                }
                break;
            case 1:
                if (val >= 0) {
                    this.mnum.Add(val);
                } else {
                    this.integerMode = 2;
                    this.largeValue = this.mnum.ToBigInteger();
                    valValue = BigInteger.valueOf(val);
                    this.largeValue = this.largeValue.add(valValue);
                }
                break;
            case 2:
                valValue = BigInteger.valueOf(val);
                this.largeValue = this.largeValue.add(valValue);
                break;
            default:
                throw new Error();
        }
        return this;
    };

    prototype.CanFitInInt32 = function() {
        switch(this.integerMode) {
            case 0:
                return true;
            case 1:
                return this.mnum.CanFitInInt32();
            case 2:
                {
                    return this.largeValue.canFitInInt();
                }
            default:
                throw new Error();
        }
    };

    prototype.toString = function() {
        switch(this.integerMode) {
            case 0:
                return (((this.smallValue)|0)+"");
            case 1:
                return this.mnum.ToBigInteger().toString();
            case 2:
                return this.largeValue.toString();
            default:
                return "";
        }
    };

    prototype.signum = function() {
        switch(this.integerMode) {
            case 0:
                return ((this.smallValue == 0) ? 0 : ((this.smallValue < 0) ? -1 : 1));
            case 1:
                return this.mnum.signum();
            case 2:
                return this.largeValue.signum();
            default:
                return 0;
        }
    };

    prototype.isValueZero = function() {
        switch(this.integerMode) {
            case 0:
                return this.smallValue == 0;
            case 1:
                return this.mnum.signum() == 0;
            case 2:
                return this.largeValue.signum() == 0;
            default:
                return false;
        }
    };

    prototype.CompareToInt = function(val) {
        switch(this.integerMode) {
            case 0:
                return (val == this.smallValue) ? 0 : (this.smallValue < val ? -1 : 1);
            case 1:
                return this.mnum.ToBigInteger().compareTo(BigInteger.valueOf(val));
            case 2:
                return this.largeValue.compareTo(BigInteger.valueOf(val));
            default:
                return 0;
        }
    };

    prototype.MinInt32 = function(val) {
        return this.CompareToInt(val) < 0 ? this.AsInt32() : val;
    };

    prototype.AsBigInteger = function() {
        switch(this.integerMode) {
            case 0:
                return BigInteger.valueOf(this.smallValue);
            case 1:
                return this.mnum.ToBigInteger();
            case 2:
                return this.largeValue;
            default:
                throw new Error();
        }
    };
})(FastInteger,FastInteger.prototype);

var BitShiftAccumulator =

function(bigint, lastDiscarded, olderDiscarded) {

    if (bigint.signum() < 0) throw new Error("bigint is negative");
    this.shiftedBigInt = bigint;
    this.discardedBitCount = new FastInteger(0);
    this.bitsAfterLeftmost = (olderDiscarded != 0) ? 1 : 0;
    this.bitLeftmost = (lastDiscarded != 0) ? 1 : 0;
};
(function(constructor,prototype){
    prototype.bitLeftmost = null;
    prototype.getLastDiscardedDigit = function() {
        return this.bitLeftmost;
    };
    prototype.bitsAfterLeftmost = null;
    constructor.SmallBitLength = 32;
    prototype.getOlderDiscardedDigits = function() {
        return this.bitsAfterLeftmost;
    };
    prototype.shiftedBigInt = null;
    prototype.knownBitLength = null;
    prototype.GetDigitLength = function() {
        if (this.knownBitLength == null) {
            this.knownBitLength = this.CalcKnownBitLength();
        }
        return FastInteger.Copy(this.knownBitLength);
    };
    prototype.ShiftToDigits = function(bits) {
        if (bits.signum() < 0) throw new Error("bits is negative");
        if (bits.CanFitInInt32()) {
            this.ShiftToDigitsInt(bits.AsInt32());
        } else {
            this.knownBitLength = this.CalcKnownBitLength();
            var bigintDiff = this.knownBitLength.AsBigInteger();
            var bitsBig = bits.AsBigInteger();
            bigintDiff = bigintDiff.subtract(bitsBig);
            if (bigintDiff.signum() > 0) {
                this.ShiftRight(FastInteger.FromBig(bigintDiff));
            }
        }
    };
    prototype.shiftedSmall = null;
    prototype.isSmall = null;
    prototype.getShiftedInt = function() {
        if (this.isSmall) return BigInteger.valueOf(this.shiftedSmall); else return this.shiftedBigInt;
    };
    prototype.getShiftedIntFast = function() {
        if (this.isSmall) {
            return new FastInteger(this.shiftedSmall);
        } else {
            return FastInteger.FromBig(this.shiftedBigInt);
        }
    };
    prototype.discardedBitCount = null;
    prototype.getDiscardedDigitCount = function() {
        return this.discardedBitCount;
    };
    constructor.FromInt32 = function(smallNumber) {
        if (smallNumber < 0) throw new Error("longInt is negative");
        var bsa = new BitShiftAccumulator(BigInteger.ZERO, 0, 0);
        bsa.shiftedSmall = smallNumber;
        bsa.discardedBitCount = new FastInteger(0);
        bsa.isSmall = true;
        return bsa;
    };

    prototype.ShiftRight = function(fastint) {
        if (fastint.signum() <= 0) return;
        if (fastint.CanFitInInt32()) {
            this.ShiftRightInt(fastint.AsInt32());
        } else {
            var bi = fastint.AsBigInteger();
            while (bi.signum() > 0) {
                var count = 1000000;
                if (bi.compareTo(BigInteger.valueOf(1000000)) < 0) {
                    count = bi.intValue();
                }
                this.ShiftRightInt(count);
                bi = bi.subtract(BigInteger.valueOf(count));
                if (this.isSmall ? this.shiftedSmall == 0 : this.shiftedBigInt.signum() == 0) {
                    break;
                }
            }
        }
    };
    prototype.ShiftRightBig = function(bits) {
        if (bits <= 0) return;
        if (this.shiftedBigInt.signum() == 0) {
            this.discardedBitCount.AddInt(bits);
            this.bitsAfterLeftmost |= this.bitLeftmost;
            this.bitLeftmost = 0;
            this.knownBitLength = new FastInteger(1);
            return;
        }
        var bytes = this.shiftedBigInt.toByteArray(true);
        this.knownBitLength = BitShiftAccumulator.ByteArrayBitLength(bytes);
        var bitDiff = new FastInteger(0);
        var bitShift = null;
        if (this.knownBitLength.CompareToInt(bits) < 0) {
            bitDiff = new FastInteger(bits).Subtract(this.knownBitLength);
            bitShift = FastInteger.Copy(this.knownBitLength);
        } else {
            bitShift = new FastInteger(bits);
        }
        if (this.knownBitLength.CompareToInt(bits) <= 0) {
            this.isSmall = true;
            this.shiftedSmall = 0;
            this.knownBitLength.SetInt(1);
        } else {
            var tmpBitShift = FastInteger.Copy(bitShift);
            while (tmpBitShift.signum() > 0 && this.shiftedBigInt.signum() != 0) {
                var bs = tmpBitShift.MinInt32(1000000);
                this.shiftedBigInt = this.shiftedBigInt.shiftRight(bs);
                tmpBitShift.SubtractInt(bs);
            }
            this.knownBitLength.Subtract(bitShift);
        }
        this.discardedBitCount.AddInt(bits);
        this.bitsAfterLeftmost |= this.bitLeftmost;
        for (var i = 0; i < bytes.length; i++) {
            if (bitShift.CompareToInt(8) > 0) {

                this.bitsAfterLeftmost |= bytes[i];
                bitShift.SubtractInt(8);
            } else {

                this.bitsAfterLeftmost |= ((bytes[i] << (9 - bitShift.AsInt32())) & 255);

                this.bitLeftmost = (bytes[i] >> ((bitShift.AsInt32()) - 1)) & 1;
                break;
            }
        }
        this.bitsAfterLeftmost = (this.bitsAfterLeftmost != 0) ? 1 : 0;
        if (bitDiff.signum() > 0) {

            this.bitsAfterLeftmost |= this.bitLeftmost;
            this.bitLeftmost = 0;
        }
    };
    constructor.ByteArrayBitLength = function(bytes) {
        var fastKB = new FastInteger(bytes.length).Multiply(8);
        for (var i = bytes.length - 1; i >= 0; i--) {
            var b = ((bytes[i])|0);
            if (b != 0) {
                if ((b & 128) != 0) {
                    break;
                }
                if ((b & 64) != 0) {
                    fastKB.Decrement();
                    break;
                }
                if ((b & 32) != 0) {
                    fastKB.SubtractInt(2);
                    break;
                }
                if ((b & 16) != 0) {
                    fastKB.SubtractInt(3);
                    break;
                }
                if ((b & 8) != 0) {
                    fastKB.SubtractInt(4);
                    break;
                }
                if ((b & 4) != 0) {
                    fastKB.SubtractInt(5);
                    break;
                }
                if ((b & 2) != 0) {
                    fastKB.SubtractInt(6);
                    break;
                }
                if ((b & 1) != 0) {
                    fastKB.SubtractInt(7);
                    break;
                }
            }
            fastKB.SubtractInt(8);
        }

        if (fastKB.signum() == 0) fastKB.Increment();
        return fastKB;
    };
    prototype.CalcKnownBitLength = function() {
        if (this.isSmall) {
            var kb = BitShiftAccumulator.SmallBitLength;
            for (var i = BitShiftAccumulator.SmallBitLength - 1; i >= 0; i++) {
                if ((this.shiftedSmall & (1 << i)) != 0) {
                    break;
                } else {
                    kb--;
                }
            }

            if (kb == 0) kb++;
            return new FastInteger(kb);
        } else {
            var bytes = this.shiftedBigInt.toByteArray(true);

            return BitShiftAccumulator.ByteArrayBitLength(bytes);
        }
    };

    prototype.ShiftBigToBits = function(bits) {
        var bytes = this.shiftedBigInt.toByteArray(true);
        this.knownBitLength = BitShiftAccumulator.ByteArrayBitLength(bytes);

        if (this.knownBitLength.CompareToInt(bits) > 0) {
            var bitShift = FastInteger.Copy(this.knownBitLength).SubtractInt(bits);
            var tmpBitShift = FastInteger.Copy(bitShift);
            while (tmpBitShift.signum() > 0 && this.shiftedBigInt.signum() != 0) {
                var bs = tmpBitShift.MinInt32(1000000);
                this.shiftedBigInt = this.shiftedBigInt.shiftRight(bs);
                tmpBitShift.SubtractInt(bs);
            }
            this.knownBitLength.SetInt(bits);
            if (bits < BitShiftAccumulator.SmallBitLength) {

                this.isSmall = true;
                this.shiftedSmall = this.shiftedBigInt.intValue();
            }
            this.bitsAfterLeftmost |= this.bitLeftmost;
            this.discardedBitCount.Add(bitShift);
            for (var i = 0; i < bytes.length; i++) {
                if (bitShift.CompareToInt(8) > 0) {

                    this.bitsAfterLeftmost |= bytes[i];
                    bitShift.SubtractInt(8);
                } else {

                    this.bitsAfterLeftmost |= ((bytes[i] << (9 - bitShift.AsInt32())) & 255);

                    this.bitLeftmost = (bytes[i] >> ((bitShift.AsInt32()) - 1)) & 1;
                    break;
                }
            }
            this.bitsAfterLeftmost = (this.bitsAfterLeftmost != 0) ? 1 : 0;
        }
    };

    prototype.ShiftRightInt = function(bits) {
        if (this.isSmall) this.ShiftRightSmall(bits); else this.ShiftRightBig(bits);
    };
    prototype.ShiftRightSmall = function(bits) {
        if (bits <= 0) return;
        if (this.shiftedSmall == 0) {
            this.discardedBitCount.AddInt(bits);
            this.bitsAfterLeftmost |= this.bitLeftmost;
            this.bitLeftmost = 0;
            this.knownBitLength = new FastInteger(1);
            return;
        }
        var kb = BitShiftAccumulator.SmallBitLength;
        for (var i = BitShiftAccumulator.SmallBitLength - 1; i >= 0; i++) {
            if ((this.shiftedSmall & (1 << i)) != 0) {
                break;
            } else {
                kb--;
            }
        }
        var shift = ((kb < bits ? kb : bits)|0);
        var shiftingMoreBits = (bits > kb);
        kb = kb - shift;
        this.knownBitLength = new FastInteger(kb);
        this.discardedBitCount.AddInt(bits);
        this.bitsAfterLeftmost |= this.bitLeftmost;

        this.bitsAfterLeftmost |= (((this.shiftedSmall << (BitShiftAccumulator.SmallBitLength + 1 - shift)) != 0) ? 1 : 0);

        this.bitLeftmost = ((((this.shiftedSmall >> ((shift) - 1)) & 1))|0);
        this.shiftedSmall >>= shift;
        if (shiftingMoreBits) {

            this.bitsAfterLeftmost |= this.bitLeftmost;
            this.bitLeftmost = 0;
        }
        this.bitsAfterLeftmost = (this.bitsAfterLeftmost != 0) ? 1 : 0;
    };

    prototype.ShiftToDigitsInt = function(bits) {
        if (bits < 0) throw new Error("bits is negative");
        if (this.isSmall) this.ShiftSmallToBits(bits); else this.ShiftBigToBits(bits);
    };
    prototype.ShiftSmallToBits = function(bits) {
        var kbl = BitShiftAccumulator.SmallBitLength;
        for (var i = BitShiftAccumulator.SmallBitLength - 1; i >= 0; i++) {
            if ((this.shiftedSmall & (1 << i)) != 0) {
                break;
            } else {
                kbl--;
            }
        }
        if (kbl == 0) kbl++;

        if (kbl > bits) {
            var bitShift = kbl - (bits|0);
            var shift = (bitShift|0);
            this.knownBitLength = new FastInteger(bits);
            this.discardedBitCount.AddInt(bitShift);
            this.bitsAfterLeftmost |= this.bitLeftmost;

            this.bitsAfterLeftmost |= (((this.shiftedSmall << (BitShiftAccumulator.SmallBitLength + 1 - shift)) != 0) ? 1 : 0);

            this.bitLeftmost = ((((this.shiftedSmall >> ((shift|0) - 1)) & 1))|0);
            this.bitsAfterLeftmost = (this.bitsAfterLeftmost != 0) ? 1 : 0;
            this.shiftedSmall >>= shift;
        } else {
            this.knownBitLength = new FastInteger(kbl);
        }
    };
})(BitShiftAccumulator,BitShiftAccumulator.prototype);

var DigitShiftAccumulator =

function(bigint, lastDiscarded, olderDiscarded) {

    if (bigint.canFitInInt()) {
        this.shiftedSmall = bigint.intValue();
        if (this.shiftedSmall < 0) throw new Error("bigint is negative");
        this.isSmall = true;
    } else {
        this.shiftedBigInt = bigint;
        this.isSmall = false;
    }
    this.bitsAfterLeftmost = (olderDiscarded != 0) ? 1 : 0;
    this.bitLeftmost = lastDiscarded;
};
(function(constructor,prototype){
    prototype.bitLeftmost = null;
    prototype.getLastDiscardedDigit = function() {
        return this.bitLeftmost;
    };
    prototype.bitsAfterLeftmost = null;
    prototype.getOlderDiscardedDigits = function() {
        return this.bitsAfterLeftmost;
    };
    prototype.shiftedBigInt = null;
    prototype.knownBitLength = null;
    prototype.GetDigitLength = function() {
        if (this.knownBitLength == null) {
            this.knownBitLength = this.CalcKnownDigitLength();
        }
        return FastInteger.Copy(this.knownBitLength);
    };
    prototype.shiftedSmall = null;
    prototype.isSmall = null;
    prototype.discardedBitCount = null;
    prototype.getDiscardedDigitCount = function() {
        if (this.discardedBitCount == null) this.discardedBitCount = new FastInteger(0);
        return this.discardedBitCount;
    };
    constructor.Int32MaxValue = BigInteger.valueOf(2147483647);
    constructor.Ten = BigInteger.TEN;
    prototype.getShiftedInt = function() {
        if (this.isSmall) return BigInteger.valueOf(this.shiftedSmall); else return this.shiftedBigInt;
    };
    constructor.FastParseLong = function(str, offset, length) {

        if ((length) > 9) throw new Error("length" + " not less or equal to " + "9" + " (" + (length) + ")");
        var ret = 0;
        for (var i = 0; i < length; i++) {
            var digit = ((str.charCodeAt(offset + i)-48)|0);
            ret *= 10;
            ret = ret + (digit);
        }
        return ret;
    };

    prototype.getShiftedIntFast = function() {
        if (this.isSmall) {
            return new FastInteger(this.shiftedSmall);
        } else {
            return FastInteger.FromBig(this.shiftedBigInt);
        }
    };

    prototype.ShiftRight = function(fastint) {
        if ((fastint) == null) throw new Error("fastint");
        if (fastint.signum() <= 0) return;
        if (fastint.CanFitInInt32()) {
            this.ShiftRightInt(fastint.AsInt32());
        } else {
            var bi = fastint.AsBigInteger();
            while (bi.signum() > 0) {
                var count = 1000000;
                if (bi.compareTo(BigInteger.valueOf(1000000)) < 0) {
                    count = bi.intValue();
                }
                this.ShiftRightInt(count);
                bi = bi.subtract(BigInteger.valueOf(count));
                if (this.isSmall ? this.shiftedSmall == 0 : this.shiftedBigInt.signum() == 0) {
                    break;
                }
            }
        }
    };
    prototype.ShiftRightBig = function(digits) {
        if (digits <= 0) return;
        if (this.shiftedBigInt.signum() == 0) {
            if (this.discardedBitCount == null) this.discardedBitCount = new FastInteger(0);
            this.discardedBitCount.AddInt(digits);
            this.bitsAfterLeftmost |= this.bitLeftmost;
            this.bitLeftmost = 0;
            this.knownBitLength = new FastInteger(1);
            return;
        }

        if (digits == 1) {
            var bigrem;
            var bigquo;
            {
                var divrem = (this.shiftedBigInt).divideAndRemainder(BigInteger.TEN);
                bigquo = divrem[0];
                bigrem = divrem[1];
            }
            this.bitsAfterLeftmost |= this.bitLeftmost;
            this.bitLeftmost = bigrem.intValue();
            this.shiftedBigInt = bigquo;
            if (this.discardedBitCount == null) this.discardedBitCount = new FastInteger(0);
            this.discardedBitCount.AddInt(digits);
            if (this.knownBitLength != null) {
                if (bigquo.signum() == 0) this.knownBitLength.SetInt(0); else this.knownBitLength.Decrement();
            }
            return;
        }
        var startCount = (4 < digits - 1 ? 4 : digits - 1);
        if (startCount > 0) {
            var bigrem;
            var radixPower = DecimalUtility.FindPowerOfTen(startCount);
            var bigquo;
            {
                var divrem = (this.shiftedBigInt).divideAndRemainder(radixPower);
                bigquo = divrem[0];
                bigrem = divrem[1];
            }
            if (bigrem.signum() != 0) this.bitsAfterLeftmost |= 1;
            this.bitsAfterLeftmost |= this.bitLeftmost;
            this.shiftedBigInt = bigquo;
            if (this.discardedBitCount == null) this.discardedBitCount = new FastInteger(0);
            this.discardedBitCount.AddInt(startCount);
            digits -= startCount;
            if (this.shiftedBigInt.signum() == 0) {

                this.isSmall = true;
                this.shiftedSmall = 0;
                this.knownBitLength = new FastInteger(1);
                this.bitsAfterLeftmost = (this.bitsAfterLeftmost != 0) ? 1 : 0;
                this.bitLeftmost = 0;
                return;
            }
        }
        if (this.knownBitLength == null) this.knownBitLength = this.GetDigitLength();
        if (new FastInteger(digits).Decrement().compareTo(this.knownBitLength) >= 0) {

            this.bitsAfterLeftmost |= (this.shiftedBigInt.signum() == 0 ? 0 : 1);
            this.isSmall = true;
            this.shiftedSmall = 0;
            this.knownBitLength = new FastInteger(1);
            if (this.discardedBitCount == null) this.discardedBitCount = new FastInteger(0);
            this.discardedBitCount.AddInt(digits);
            this.bitsAfterLeftmost |= this.bitLeftmost;
            this.bitLeftmost = 0;
            return;
        }
        var str = this.shiftedBigInt.toString();

        var digitLength = str.length;
        var bitDiff = 0;
        if (digits > digitLength) {
            bitDiff = digits - digitLength;
        }
        if (this.discardedBitCount == null) this.discardedBitCount = new FastInteger(0);
        this.discardedBitCount.AddInt(digits);
        this.bitsAfterLeftmost |= this.bitLeftmost;
        var digitShift = (digitLength < digits ? digitLength : digits);
        if (digits >= digitLength) {
            this.isSmall = true;
            this.shiftedSmall = 0;
            this.knownBitLength = new FastInteger(1);
        } else {
            var newLength = ((digitLength - digitShift)|0);
            this.knownBitLength = new FastInteger(newLength);
            if (newLength <= 9) {

                this.isSmall = true;
                this.shiftedSmall = DigitShiftAccumulator.FastParseLong(str, 0, newLength);
            } else {
                this.shiftedBigInt = BigInteger.fromSubstring(str, 0, newLength);
            }
        }
        for (var i = str.length - 1; i >= 0; i--) {
            this.bitsAfterLeftmost |= this.bitLeftmost;
            this.bitLeftmost = ((str.charCodeAt(i)-48)|0);
            digitShift--;
            if (digitShift <= 0) {
                break;
            }
        }
        this.bitsAfterLeftmost = (this.bitsAfterLeftmost != 0) ? 1 : 0;
        if (bitDiff > 0) {

            this.bitsAfterLeftmost |= this.bitLeftmost;
            this.bitLeftmost = 0;
        }
    };

    prototype.ShiftToBitsBig = function(digits) {
        if (this.knownBitLength != null) {
            if (this.knownBitLength.CompareToInt(digits) <= 0) {
                return;
            }
        }
        var str;
        if (this.knownBitLength == null) this.knownBitLength = this.GetDigitLength();
        if (this.knownBitLength.CompareToInt(digits) <= 0) {
            return;
        }
        var digitDiff = FastInteger.Copy(this.knownBitLength).SubtractInt(digits);
        if (digitDiff.CompareToInt(1) == 0) {
            var bigrem;
            var bigquo;
            {
                var divrem = (this.shiftedBigInt).divideAndRemainder(DigitShiftAccumulator.Ten);
                bigquo = divrem[0];
                bigrem = divrem[1];
            }
            this.bitsAfterLeftmost |= this.bitLeftmost;
            this.bitLeftmost = bigrem.intValue();
            this.shiftedBigInt = bigquo;
            if (this.discardedBitCount == null) this.discardedBitCount = new FastInteger(0);
            this.discardedBitCount.Add(digitDiff);
            this.knownBitLength.Subtract(digitDiff);
            this.bitsAfterLeftmost = (this.bitsAfterLeftmost != 0) ? 1 : 0;
            return;
        } else if (digitDiff.CompareToInt(9) <= 0) {
            var bigrem;
            var diffInt = digitDiff.AsInt32();
            var radixPower = DecimalUtility.FindPowerOfTen(diffInt);
            var bigquo;
            {
                var divrem = (this.shiftedBigInt).divideAndRemainder(radixPower);
                bigquo = divrem[0];
                bigrem = divrem[1];
            }
            var rem = bigrem.intValue();
            this.bitsAfterLeftmost |= this.bitLeftmost;
            for (var i = 0; i < diffInt; i++) {
                if (i == diffInt - 1) {
                    this.bitLeftmost = rem % 10;
                } else {
                    this.bitsAfterLeftmost |= (rem % 10);
                    rem = ((rem / 10)|0);
                }
            }
            this.shiftedBigInt = bigquo;
            if (this.discardedBitCount == null) this.discardedBitCount = new FastInteger(0);
            this.discardedBitCount.Add(digitDiff);
            this.knownBitLength.Subtract(digitDiff);
            this.bitsAfterLeftmost = (this.bitsAfterLeftmost != 0) ? 1 : 0;
            return;
        } else if (digitDiff.CompareToInt(2147483647) <= 0) {
            var bigrem;
            var radixPower = DecimalUtility.FindPowerOfTen(digitDiff.AsInt32() - 1);
            var bigquo;
            {
                var divrem = (this.shiftedBigInt).divideAndRemainder(radixPower);
                bigquo = divrem[0];
                bigrem = divrem[1];
            }
            this.bitsAfterLeftmost |= this.bitLeftmost;
            if (bigrem.signum() != 0) this.bitsAfterLeftmost |= 1;
            {
                var bigquo2;
                {
                    var divrem = (bigquo).divideAndRemainder(DigitShiftAccumulator.Ten);
                    bigquo2 = divrem[0];
                    bigrem = divrem[1];
                }
                this.bitLeftmost = bigrem.intValue();
                this.shiftedBigInt = bigquo2;
            }
            if (this.discardedBitCount == null) this.discardedBitCount = new FastInteger(0);
            this.discardedBitCount.Add(digitDiff);
            this.knownBitLength.Subtract(digitDiff);
            this.bitsAfterLeftmost = (this.bitsAfterLeftmost != 0) ? 1 : 0;
            return;
        }
        str = this.shiftedBigInt.toString();

        var digitLength = str.length;
        this.knownBitLength = new FastInteger(digitLength);

        if (digitLength > digits) {
            var digitShift = digitLength - digits;
            this.knownBitLength.SubtractInt(digitShift);
            var newLength = ((digitLength - digitShift)|0);

            if (this.discardedBitCount == null) this.discardedBitCount = new FastInteger(0);
            if (digitShift <= 2147483647) this.discardedBitCount.AddInt(digitShift|0); else this.discardedBitCount.AddBig(BigInteger.valueOf(digitShift));
            for (var i = str.length - 1; i >= 0; i--) {
                this.bitsAfterLeftmost |= this.bitLeftmost;
                this.bitLeftmost = ((str.charCodeAt(i)-48)|0);
                digitShift--;
                if (digitShift <= 0) {
                    break;
                }
            }
            if (newLength <= 9) {
                this.isSmall = true;
                this.shiftedSmall = DigitShiftAccumulator.FastParseLong(str, 0, newLength);
            } else {
                this.shiftedBigInt = BigInteger.fromSubstring(str, 0, newLength);
            }
            this.bitsAfterLeftmost = (this.bitsAfterLeftmost != 0) ? 1 : 0;
        }
    };

    prototype.ShiftRightInt = function(digits) {
        if (this.isSmall) this.ShiftRightSmall(digits); else this.ShiftRightBig(digits);
    };
    prototype.ShiftRightSmall = function(digits) {
        if (digits <= 0) return;
        if (this.shiftedSmall == 0) {
            if (this.discardedBitCount == null) this.discardedBitCount = new FastInteger(0);
            this.discardedBitCount.AddInt(digits);
            this.bitsAfterLeftmost |= this.bitLeftmost;
            this.bitLeftmost = 0;
            this.knownBitLength = new FastInteger(1);
            return;
        }
        var kb = 0;
        var tmp = this.shiftedSmall;
        while (tmp > 0) {
            kb++;
            tmp = ((tmp / 10)|0);
        }

        if (kb == 0) kb++;
        this.knownBitLength = new FastInteger(kb);
        if (this.discardedBitCount == null) this.discardedBitCount = new FastInteger(0);
        this.discardedBitCount.AddInt(digits);
        while (digits > 0) {
            if (this.shiftedSmall == 0) {
                this.bitsAfterLeftmost |= this.bitLeftmost;
                this.bitLeftmost = 0;
                this.knownBitLength = new FastInteger(0);
                break;
            } else {
                var digit = ((this.shiftedSmall % 10)|0);
                this.bitsAfterLeftmost |= this.bitLeftmost;
                this.bitLeftmost = digit;
                digits--;
                this.shiftedSmall = ((this.shiftedSmall / 10)|0);
                this.knownBitLength.Decrement();
            }
        }
        this.bitsAfterLeftmost = (this.bitsAfterLeftmost != 0) ? 1 : 0;
    };

    prototype.ShiftToDigits = function(bits) {
        if (bits.CanFitInInt32()) {
            var intval = bits.AsInt32();
            if (intval < 0) throw new Error("bits is negative");
            this.ShiftToDigitsInt(intval);
        } else {
            if (bits.signum() < 0) throw new Error("bits is negative");
            this.knownBitLength = this.CalcKnownDigitLength();
            var bigintDiff = this.knownBitLength.AsBigInteger();
            var bitsBig = bits.AsBigInteger();
            bigintDiff = bigintDiff.subtract(bitsBig);
            if (bigintDiff.signum() > 0) {

                this.ShiftRight(FastInteger.FromBig(bigintDiff));
            }
        }
    };

    prototype.ShiftToDigitsInt = function(digits) {
        if (this.isSmall) this.ShiftToBitsSmall(digits); else this.ShiftToBitsBig(digits);
    };
    prototype.CalcKnownDigitLength = function() {
        if (this.isSmall) {
            var kb = 0;
            var v2 = this.shiftedSmall;
            if (v2 >= 1000000000) kb = 10; else if (v2 >= 100000000) kb = 9; else if (v2 >= 10000000) kb = 8; else if (v2 >= 1000000) kb = 7; else if (v2 >= 100000) kb = 6; else if (v2 >= 10000) kb = 5; else if (v2 >= 1000) kb = 4; else if (v2 >= 100) kb = 3; else if (v2 >= 10) kb = 2; else kb = 1;
            return new FastInteger(kb);
        } else {
            return new FastInteger(this.shiftedBigInt.getDigitCount());
        }
    };
    prototype.ShiftToBitsSmall = function(digits) {
        var kb = 0;
        var v2 = this.shiftedSmall;
        if (v2 >= 1000000000) kb = 10; else if (v2 >= 100000000) kb = 9; else if (v2 >= 10000000) kb = 8; else if (v2 >= 1000000) kb = 7; else if (v2 >= 100000) kb = 6; else if (v2 >= 10000) kb = 5; else if (v2 >= 1000) kb = 4; else if (v2 >= 100) kb = 3; else if (v2 >= 10) kb = 2; else kb = 1;
        this.knownBitLength = new FastInteger(kb);
        if (kb > digits) {
            var digitShift = ((kb - digits)|0);
            var newLength = ((kb - digitShift)|0);
            this.knownBitLength = new FastInteger(1 > newLength ? 1 : newLength);
            if (this.discardedBitCount == null) this.discardedBitCount = new FastInteger(digitShift); else this.discardedBitCount.AddInt(digitShift);
            for (var i = 0; i < digitShift; i++) {
                var digit = ((this.shiftedSmall % 10)|0);
                this.shiftedSmall = ((this.shiftedSmall / 10)|0);
                this.bitsAfterLeftmost |= this.bitLeftmost;
                this.bitLeftmost = digit;
            }
            this.bitsAfterLeftmost = (this.bitsAfterLeftmost != 0) ? 1 : 0;
        }
    };
})(DigitShiftAccumulator,DigitShiftAccumulator.prototype);

var DecimalUtility = function() {

};
(function(constructor,prototype){
    constructor.BigIntPowersOfTen = [BigInteger.ONE, BigInteger.TEN, BigInteger.valueOf(100), BigInteger.valueOf(1000), BigInteger.valueOf(10000), BigInteger.valueOf(100000), BigInteger.valueOf(1000000), BigInteger.valueOf(10000000), BigInteger.valueOf(100000000), BigInteger.valueOf(1000000000), BigInteger.valueOf(JSInteropFactory.createLongFromInts(1410065408, 2)), BigInteger.valueOf(JSInteropFactory.createLongFromInts(1215752192, 23)), BigInteger.valueOf(JSInteropFactory.createLongFromInts(-727379968, 232)), BigInteger.valueOf(JSInteropFactory.createLongFromInts(1316134912, 2328)), BigInteger.valueOf(JSInteropFactory.createLongFromInts(276447232, 23283)), BigInteger.valueOf(JSInteropFactory.createLongFromInts(-1530494976, 232830)), BigInteger.valueOf(JSInteropFactory.createLongFromInts(1874919424, 2328306)), BigInteger.valueOf(JSInteropFactory.createLongFromInts(1569325056, 23283064)), BigInteger.valueOf(JSInteropFactory.createLongFromInts(-1486618624, 232830643))];
    constructor.BigIntPowersOfFive = [BigInteger.ONE, BigInteger.valueOf(5), BigInteger.valueOf(25), BigInteger.valueOf(125), BigInteger.valueOf(625), BigInteger.valueOf(3125), BigInteger.valueOf(15625), BigInteger.valueOf(78125), BigInteger.valueOf(390625), BigInteger.valueOf(1953125), BigInteger.valueOf(9765625), BigInteger.valueOf(48828125), BigInteger.valueOf(244140625), BigInteger.valueOf(1220703125), BigInteger.valueOf(JSInteropFactory.createLongFromInts(1808548329, 1)), BigInteger.valueOf(JSInteropFactory.createLongFromInts(452807053, 7)), BigInteger.valueOf(JSInteropFactory.createLongFromInts(-2030932031, 35)), BigInteger.valueOf(JSInteropFactory.createLongFromInts(-1564725563, 177)), BigInteger.valueOf(JSInteropFactory.createLongFromInts(766306777, 888)), BigInteger.valueOf(JSInteropFactory.createLongFromInts(-463433411, 4440)), BigInteger.valueOf(JSInteropFactory.createLongFromInts(1977800241, 22204)), BigInteger.valueOf(JSInteropFactory.createLongFromInts(1299066613, 111022)), BigInteger.valueOf(JSInteropFactory.createLongFromInts(-2094601527, 555111)), BigInteger.valueOf(JSInteropFactory.createLongFromInts(-1883073043, 2775557)), BigInteger.valueOf(JSInteropFactory.createLongFromInts(-825430623, 13877787)), BigInteger.valueOf(JSInteropFactory.createLongFromInts(167814181, 69388939)), BigInteger.valueOf(JSInteropFactory.createLongFromInts(839070905, 346944695)), BigInteger.valueOf(JSInteropFactory.createLongFromInts(-99612771, 1734723475))];
    constructor.ShiftLeftOne = function(arr) {
        {
            var carry = 0;
            for (var i = 0; i < arr.length; i++) {
                var item = arr[i];
                arr[i] = ((arr[i] << 1)|0) | (carry|0);
                carry = ((item >> 31) != 0) ? 1 : 0;
            }
            return carry;
        }
    };
    constructor.CountTrailingZeros = function(numberValue) {
        if (numberValue == 0) return 32;
        var i = 0;
        {
            if ((numberValue << 16) == 0) {
                numberValue >>= 16;
                i = i + (16);
            }
            if ((numberValue << 24) == 0) {
                numberValue >>= 8;
                i = i + (8);
            }
            if ((numberValue << 28) == 0) {
                numberValue >>= 4;
                i = i + (4);
            }
            if ((numberValue << 30) == 0) {
                numberValue >>= 2;
                i = i + (2);
            }
            if ((numberValue << 31) == 0) ++i;
        }
        return i;
    };
    constructor.BitPrecisionInt = function(numberValue) {
        if (numberValue == 0) return 0;
        var i = 32;
        {
            if ((numberValue >> 16) == 0) {
                numberValue <<= 16;
                i -= 8;
            }
            if ((numberValue >> 24) == 0) {
                numberValue <<= 8;
                i -= 8;
            }
            if ((numberValue >> 28) == 0) {
                numberValue <<= 4;
                i -= 4;
            }
            if ((numberValue >> 30) == 0) {
                numberValue <<= 2;
                i -= 2;
            }
            if ((numberValue >> 31) == 0) --i;
        }
        return i;
    };
    constructor.ShiftAwayTrailingZerosTwoElements = function(arr) {
        var a0 = arr[0];
        var a1 = arr[1];
        var tz = DecimalUtility.CountTrailingZeros(a0);
        if (tz == 0) return 0;
        {
            if (tz < 32) {
                var carry = a1 << (32 - tz);
                arr[0] = (((a0 >> tz) & (2147483647 >> (tz - 1)))|0) | (carry|0);
                arr[1] = ((a1 >> tz) & (2147483647 >> (tz - 1)));
                return tz;
            } else {
                tz = DecimalUtility.CountTrailingZeros(a1);
                if (tz == 32) {
                    arr[0] = 0;
                } else if (tz > 0) {
                    arr[0] = ((a1 >> tz) & (2147483647 >> (tz - 1)));
                } else {
                    arr[0] = a1;
                }
                arr[1] = 0;
                return 32 + tz;
            }
        }
    };
    constructor.HasBitSet = function(arr, bit) {
        return ((bit >> 5) < arr.length && (arr[bit >> 5] & (1 << (bit & 31))) != 0);
    };
    constructor.PowerCache = function DecimalUtility$PowerCache() {

        this.outputs = [];
        this.outputs.length = DecimalUtility.PowerCache.MaxSize;
        this.inputs = [];
        this.inputs.length = DecimalUtility.PowerCache.MaxSize;
    };
    (function(constructor,prototype){
        constructor.MaxSize = 64;
        prototype.outputs = null;
        prototype.inputs = null;
        prototype.size = null;
        prototype.FindCachedPowerOrSmaller = function(bi) {
            var ret = null;
            var minValue = null;
            {
                for (var i = 0; i < this.size; i++) {
                    if (this.inputs[i].compareTo(bi) <= 0 && (minValue == null || this.inputs[i].compareTo(minValue) >= 0)) {

                        ret = [this.inputs[i], this.outputs[i]];
                        minValue = this.inputs[i];
                    }
                }
            }
            return ret;
        };

        prototype.GetCachedPower = function(bi) {
            {
                for (var i = 0; i < this.size; i++) {
                    if (bi.equals(this.inputs[i])) {
                        if (i != 0) {
                            var tmp;

                            tmp = this.inputs[i];
                            this.inputs[i] = this.inputs[0];
                            this.inputs[0] = tmp;
                            tmp = this.outputs[i];
                            this.outputs[i] = this.outputs[0];
                            this.outputs[0] = tmp;

                            if (i != 1) {
                                tmp = this.inputs[i];
                                this.inputs[i] = this.inputs[1];
                                this.inputs[1] = tmp;
                                tmp = this.outputs[i];
                                this.outputs[i] = this.outputs[1];
                                this.outputs[1] = tmp;
                            }
                        }
                        return this.outputs[0];
                    }
                }
            }
            return null;
        };

        prototype.AddPower = function(input, output) {
            {
                if (this.size < DecimalUtility.PowerCache.MaxSize) {

                    for (var i = this.size; i > 0; i--) {
                        this.inputs[i] = this.inputs[i - 1];
                        this.outputs[i] = this.outputs[i - 1];
                    }
                    this.inputs[0] = input;
                    this.outputs[0] = output;
                    this.size++;
                } else {

                    for (var i = DecimalUtility.PowerCache.MaxSize - 1; i > 0; i--) {
                        this.inputs[i] = this.inputs[i - 1];
                        this.outputs[i] = this.outputs[i - 1];
                    }
                    this.inputs[0] = input;
                    this.outputs[0] = output;
                }
            }
        };
    })(DecimalUtility.PowerCache,DecimalUtility.PowerCache.prototype);

    constructor.powerOfFiveCache = new DecimalUtility.PowerCache();
    constructor.powerOfTenCache = new DecimalUtility.PowerCache();
    constructor.FindPowerOfFiveFromBig = function(diff) {
        var sign = diff.signum();
        if (sign < 0) return BigInteger.ZERO;
        if (sign == 0) return BigInteger.ONE;
        var intcurexp = FastInteger.FromBig(diff);
        if (intcurexp.CompareToInt(54) <= 0) {
            return DecimalUtility.FindPowerOfFive(intcurexp.AsInt32());
        }
        var mantissa = BigInteger.ONE;
        var bigpow;
        var origdiff = diff;
        bigpow = DecimalUtility.powerOfFiveCache.GetCachedPower(origdiff);
        if (bigpow != null) return bigpow;
        var otherPower = DecimalUtility.powerOfFiveCache.FindCachedPowerOrSmaller(origdiff);
        if (otherPower != null) {
            intcurexp.SubtractBig(otherPower[0]);
            bigpow = otherPower[1];
            mantissa = bigpow;
        } else {
            bigpow = BigInteger.ZERO;
        }
        while (intcurexp.signum() > 0) {
            if (intcurexp.CompareToInt(27) <= 0) {
                bigpow = DecimalUtility.FindPowerOfFive(intcurexp.AsInt32());
                mantissa = mantissa.multiply(bigpow);
                break;
            } else if (intcurexp.CompareToInt(9999999) <= 0) {
                bigpow = (DecimalUtility.FindPowerOfFive(1)).pow(intcurexp.AsInt32());
                mantissa = mantissa.multiply(bigpow);
                break;
            } else {
                if (bigpow.signum() == 0) bigpow = (DecimalUtility.FindPowerOfFive(1)).pow(9999999);
                mantissa = mantissa.multiply(bigpow);
                intcurexp.AddInt(-9999999);
            }
        }
        DecimalUtility.powerOfFiveCache.AddPower(origdiff, mantissa);
        return mantissa;
    };
    constructor.BigInt36 = BigInteger.valueOf(36);
    constructor.FindPowerOfTenFromBig = function(bigintExponent) {
        var sign = bigintExponent.signum();
        if (sign < 0) return BigInteger.ZERO;
        if (sign == 0) return BigInteger.ONE;
        if (bigintExponent.compareTo(DecimalUtility.BigInt36) <= 0) {
            return DecimalUtility.FindPowerOfTen(bigintExponent.intValue());
        }
        var intcurexp = FastInteger.FromBig(bigintExponent);
        var mantissa = BigInteger.ONE;
        var bigpow = BigInteger.ZERO;
        while (intcurexp.signum() > 0) {
            if (intcurexp.CompareToInt(18) <= 0) {
                bigpow = DecimalUtility.FindPowerOfTen(intcurexp.AsInt32());
                mantissa = mantissa.multiply(bigpow);
                break;
            } else if (intcurexp.CompareToInt(9999999) <= 0) {
                var val = intcurexp.AsInt32();
                bigpow = DecimalUtility.FindPowerOfFive(val);
                bigpow = bigpow.shiftLeft(val);
                mantissa = mantissa.multiply(bigpow);
                break;
            } else {
                if (bigpow.signum() == 0) {
                    bigpow = DecimalUtility.FindPowerOfFive(9999999);
                    bigpow = bigpow.shiftLeft(9999999);
                }
                mantissa = mantissa.multiply(bigpow);
                intcurexp.AddInt(-9999999);
            }
        }
        return mantissa;
    };
    constructor.FivePower40 = (BigInteger.valueOf(JSInteropFactory.createLongFromInts(1977800241, 22204))).multiply(BigInteger.valueOf(JSInteropFactory.createLongFromInts(1977800241, 22204)));
    constructor.FindPowerOfFive = function(precision) {
        if (precision < 0) return BigInteger.ZERO;
        if (precision == 0) return BigInteger.ONE;
        var bigpow;
        var ret;
        if (precision <= 27) return DecimalUtility.BigIntPowersOfFive[(precision|0)];
        if (precision == 40) return DecimalUtility.FivePower40;
        var startPrecision = precision;
        var origPrecision = BigInteger.valueOf(precision);
        bigpow = DecimalUtility.powerOfFiveCache.GetCachedPower(origPrecision);
        if (bigpow != null) return bigpow;
        if (precision <= 54) {
            if ((precision & 1) == 0) {
                ret = DecimalUtility.BigIntPowersOfFive[((precision >> 1)|0)];
                ret = ret.multiply(ret);
                DecimalUtility.powerOfFiveCache.AddPower(origPrecision, ret);
                return ret;
            } else {
                ret = DecimalUtility.BigIntPowersOfFive[27];
                bigpow = DecimalUtility.BigIntPowersOfFive[(precision|0) - 27];
                ret = ret.multiply(bigpow);
                DecimalUtility.powerOfFiveCache.AddPower(origPrecision, ret);
                return ret;
            }
        }
        if (precision > 40 && precision <= 94) {
            ret = DecimalUtility.FivePower40;
            bigpow = DecimalUtility.FindPowerOfFive(precision - 40);
            ret = ret.multiply(bigpow);
            DecimalUtility.powerOfFiveCache.AddPower(origPrecision, ret);
            return ret;
        }
        var otherPower;
        var first = true;
        bigpow = BigInteger.ZERO;
        while (true) {
            otherPower = DecimalUtility.powerOfFiveCache.FindCachedPowerOrSmaller(BigInteger.valueOf(precision));
            if (otherPower != null) {
                var otherPower0 = otherPower[0];
                var otherPower1 = otherPower[1];
                precision -= otherPower0.intValue();
                if (first) bigpow = otherPower[1]; else {
                    bigpow = bigpow.multiply(otherPower1);
                }
                first = false;
            } else {
                break;
            }
        }
        ret = (!first ? bigpow : BigInteger.ONE);
        while (precision > 0) {
            if (precision <= 27) {
                bigpow = DecimalUtility.BigIntPowersOfFive[(precision|0)];
                if (first) ret = bigpow; else ret = ret.multiply(bigpow);
                first = false;
                break;
            } else if (precision <= 9999999) {

                bigpow = (DecimalUtility.BigIntPowersOfFive[1]).pow(precision);
                if (precision != startPrecision) {
                    var bigprec = BigInteger.valueOf(precision);
                    DecimalUtility.powerOfFiveCache.AddPower(bigprec, bigpow);
                }
                if (first) ret = bigpow; else ret = ret.multiply(bigpow);
                first = false;
                break;
            } else {
                if (bigpow.signum() == 0) bigpow = DecimalUtility.FindPowerOfFive(9999999);
                if (first) ret = bigpow; else ret = ret.multiply(bigpow);
                first = false;
                precision -= 9999999;
            }
        }
        DecimalUtility.powerOfFiveCache.AddPower(origPrecision, ret);
        return ret;
    };
    constructor.FindPowerOfTen = function(precision) {
        if (precision < 0) return BigInteger.ZERO;
        if (precision == 0) return BigInteger.ONE;
        var bigpow;
        var ret;
        if (precision <= 18) return DecimalUtility.BigIntPowersOfTen[(precision|0)];
        var startPrecision = precision;
        var origPrecision = BigInteger.valueOf(precision);
        bigpow = DecimalUtility.powerOfTenCache.GetCachedPower(origPrecision);
        if (bigpow != null) return bigpow;
        if (precision <= 27) {
            var prec = (precision|0);
            ret = DecimalUtility.BigIntPowersOfFive[prec];
            ret = ret.shiftLeft(prec);
            DecimalUtility.powerOfTenCache.AddPower(origPrecision, ret);
            return ret;
        }
        if (precision <= 36) {
            if ((precision & 1) == 0) {
                ret = DecimalUtility.BigIntPowersOfTen[((precision >> 1)|0)];
                ret = ret.multiply(ret);
                DecimalUtility.powerOfTenCache.AddPower(origPrecision, ret);
                return ret;
            } else {
                ret = DecimalUtility.BigIntPowersOfTen[18];
                bigpow = DecimalUtility.BigIntPowersOfTen[(precision|0) - 18];
                ret = ret.multiply(bigpow);
                DecimalUtility.powerOfTenCache.AddPower(origPrecision, ret);
                return ret;
            }
        }
        var otherPower;
        var first = true;
        bigpow = BigInteger.ZERO;
        while (true) {
            otherPower = DecimalUtility.powerOfTenCache.FindCachedPowerOrSmaller(BigInteger.valueOf(precision));
            if (otherPower != null) {
                var otherPower0 = otherPower[0];
                var otherPower1 = otherPower[1];
                precision -= otherPower0.intValue();
                if (first) bigpow = otherPower[1]; else {
                    bigpow = bigpow.multiply(otherPower1);
                }
                first = false;
            } else {
                break;
            }
        }
        ret = (!first ? bigpow : BigInteger.ONE);
        while (precision > 0) {
            if (precision <= 27) {
                bigpow = DecimalUtility.BigIntPowersOfTen[(precision|0)];
                if (first) ret = bigpow; else ret = ret.multiply(bigpow);
                first = false;
                break;
            } else if (precision <= 9999999) {

                bigpow = DecimalUtility.FindPowerOfFive(precision);
                bigpow = bigpow.shiftLeft(precision);
                if (precision != startPrecision) {
                    var bigprec = BigInteger.valueOf(precision);
                    DecimalUtility.powerOfTenCache.AddPower(bigprec, bigpow);
                }
                if (first) ret = bigpow; else ret = ret.multiply(bigpow);
                first = false;
                break;
            } else {
                if (bigpow.signum() == 0) bigpow = DecimalUtility.FindPowerOfTen(9999999);
                if (first) ret = bigpow; else ret = ret.multiply(bigpow);
                first = false;
                precision -= 9999999;
            }
        }
        DecimalUtility.powerOfTenCache.AddPower(origPrecision, ret);
        return ret;
    };
})(DecimalUtility,DecimalUtility.prototype);

var Rounding={};Rounding.Up=0;Rounding['Up']=0;Rounding.Down=1;Rounding['Down']=1;Rounding.Ceiling=2;Rounding['Ceiling']=2;Rounding.Floor=3;Rounding['Floor']=3;Rounding.HalfUp=4;Rounding['HalfUp']=4;Rounding.HalfDown=5;Rounding['HalfDown']=5;Rounding.HalfEven=6;Rounding['HalfEven']=6;Rounding.Unnecessary=7;Rounding['Unnecessary']=7;Rounding.ZeroFiveUp=8;Rounding['ZeroFiveUp']=8;

if(typeof exports!=="undefined")exports['Rounding']=Rounding;
if(typeof window!=="undefined")window['Rounding']=Rounding;

var PrecisionContext =

function(precision, rounding, exponentMinSmall, exponentMaxSmall, clampNormalExponents) {

    if ((precision) < 0) throw new Error("precision" + " not greater or equal to " + "0" + " (" + (precision) + ")");
    if ((exponentMinSmall) > exponentMaxSmall) throw new Error("exponentMinSmall" + " not less or equal to " + (exponentMaxSmall) + " (" + (exponentMinSmall) + ")");
    this.bigintPrecision = precision == 0 ? BigInteger.ZERO : BigInteger.valueOf(precision);
    this.rounding = rounding;
    this.clampNormalExponents = clampNormalExponents;
    this.hasExponentRange = true;
    this.exponentMax = exponentMaxSmall == 0 ? BigInteger.ZERO : BigInteger.valueOf(exponentMaxSmall);
    this.exponentMin = exponentMinSmall == 0 ? BigInteger.ZERO : BigInteger.valueOf(exponentMinSmall);
};
(function(constructor,prototype){
    prototype['exponentMax'] = prototype.exponentMax = null;
    prototype['getEMax'] = prototype.getEMax = function() {
        return this.hasExponentRange ? this.exponentMax : BigInteger.ZERO;
    };
    prototype['exponentMin'] = prototype.exponentMin = null;
    prototype['hasExponentRange'] = prototype.hasExponentRange = null;
    prototype['getHasExponentRange'] = prototype.getHasExponentRange = function() {
        return this.hasExponentRange;
    };
    prototype['getEMin'] = prototype.getEMin = function() {
        return this.hasExponentRange ? this.exponentMin : BigInteger.ZERO;
    };
    prototype['bigintPrecision'] = prototype.bigintPrecision = null;
    prototype['getPrecision'] = prototype.getPrecision = function() {
        return this.bigintPrecision;
    };
    prototype['rounding'] = prototype.rounding = null;
    prototype['clampNormalExponents'] = prototype.clampNormalExponents = null;
    prototype['getClampNormalExponents'] = prototype.getClampNormalExponents = function() {
        return this.hasExponentRange ? this.clampNormalExponents : false;
    };
    prototype['getRounding'] = prototype.getRounding = function() {
        return this.rounding;
    };
    prototype['flags'] = prototype.flags = null;
    prototype['hasFlags'] = prototype.hasFlags = null;
    prototype['getHasFlags'] = prototype.getHasFlags = function() {
        return this.hasFlags;
    };
    constructor['FlagInexact'] = constructor.FlagInexact = 1;
    constructor['FlagRounded'] = constructor.FlagRounded = 2;
    constructor['FlagSubnormal'] = constructor.FlagSubnormal = 4;
    constructor['FlagUnderflow'] = constructor.FlagUnderflow = 8;
    constructor['FlagOverflow'] = constructor.FlagOverflow = 16;
    constructor['FlagClamped'] = constructor.FlagClamped = 32;
    constructor['FlagInvalid'] = constructor.FlagInvalid = 64;
    constructor['FlagDivideByZero'] = constructor.FlagDivideByZero = 128;
    prototype['getFlags'] = prototype.getFlags = function() {
        return this.flags;
    };
    prototype['setFlags'] = prototype.setFlags = function(value) {
        if (!this.getHasFlags()) throw new Error("Can't set flags");
        this.flags = value;
    };
    prototype['ExponentWithinRange'] = prototype.ExponentWithinRange = function(exponent) {
        if ((exponent) == null) throw new Error("exponent");
        if (!this.getHasExponentRange()) return true;
        if (this.bigintPrecision.signum() == 0) {
            return exponent.compareTo(this.getEMax()) <= 0;
        } else {
            var bigint = exponent;
            bigint = bigint.add(this.bigintPrecision);
            bigint = bigint.subtract(BigInteger.ONE);
            if (bigint.compareTo(this.getEMin()) < 0) return false;
            if (exponent.compareTo(this.getEMax()) > 0) return false;
            return true;
        }
    };
    prototype['WithRounding'] = prototype.WithRounding = function(rounding) {
        var pc = this.Copy();
        pc.rounding = rounding;
        return pc;
    };
    prototype['WithBlankFlags'] = prototype.WithBlankFlags = function() {
        var pc = this.Copy();
        pc.hasFlags = true;
        pc.flags = 0;
        return pc;
    };
    prototype['WithExponentClamp'] = prototype.WithExponentClamp = function(clamp) {
        var pc = this.Copy();
        pc.clampNormalExponents = clamp;
        return pc;
    };
    prototype['WithExponentRange'] = prototype.WithExponentRange = function(exponentMin, exponentMax) {
        if ((exponentMin) == null) throw new Error("exponentMin");
        if (exponentMin.compareTo(exponentMax) > 0) throw new Error("exponentMin greater than exponentMax");
        var pc = this.Copy();
        pc.hasExponentRange = true;
        pc.exponentMin = exponentMin;
        pc.exponentMax = exponentMax;
        return pc;
    };
    prototype['WithNoFlags'] = prototype.WithNoFlags = function() {
        var pc = this.Copy();
        pc.hasFlags = false;
        pc.flags = 0;
        return pc;
    };
    prototype['WithUnlimitedExponents'] = prototype.WithUnlimitedExponents = function() {
        var pc = this.Copy();
        pc.hasExponentRange = false;
        return pc;
    };
    prototype['WithPrecision'] = prototype.WithPrecision = function(precision) {
        if (precision < 0) throw new Error("precision" + " not greater or equal to " + "0" + " (" + (precision) + ")");
        var pc = this.Copy();
        pc.bigintPrecision = BigInteger.valueOf(precision);
        return pc;
    };
    prototype['WithBigPrecision'] = prototype.WithBigPrecision = function(bigintPrecision) {
        if ((bigintPrecision) == null) throw new Error("bigintPrecision");
        if (bigintPrecision.signum() < 0) throw new Error("precision" + " not greater or equal to " + "0" + " (" + bigintPrecision + ")");
        var pc = this.Copy();
        pc.bigintPrecision = bigintPrecision;
        return pc;
    };
    prototype['Copy'] = prototype.Copy = function() {
        var pcnew = new PrecisionContext(0, this.rounding, 0, 0, this.clampNormalExponents);
        pcnew.hasFlags = this.hasFlags;
        pcnew.flags = this.flags;
        pcnew.exponentMax = this.exponentMax;
        pcnew.exponentMin = this.exponentMin;
        pcnew.hasExponentRange = this.hasExponentRange;
        pcnew.bigintPrecision = this.bigintPrecision;
        pcnew.rounding = this.rounding;
        pcnew.clampNormalExponents = this.clampNormalExponents;
        return pcnew;
    };
    constructor['ForPrecision'] = constructor.ForPrecision = function(precision) {
        return new PrecisionContext(precision, Rounding.HalfUp, 0, 0, false).WithUnlimitedExponents();
    };
    constructor['ForRounding'] = constructor.ForRounding = function(rounding) {
        return new PrecisionContext(0, rounding, 0, 0, false).WithUnlimitedExponents();
    };
    constructor['ForPrecisionAndRounding'] = constructor.ForPrecisionAndRounding = function(precision, rounding) {
        return new PrecisionContext(precision, rounding, 0, 0, false).WithUnlimitedExponents();
    };
    constructor['Unlimited'] = constructor.Unlimited = PrecisionContext.ForPrecision(0);
    constructor['Decimal32'] = constructor.Decimal32 = new PrecisionContext(7, Rounding.HalfEven, -95, 96, true);
    constructor['Decimal64'] = constructor.Decimal64 = new PrecisionContext(16, Rounding.HalfEven, -383, 384, true);
    constructor['Decimal128'] = constructor.Decimal128 = new PrecisionContext(34, Rounding.HalfEven, -6143, 6144, true);
    constructor['CliDecimal'] = constructor.CliDecimal = new PrecisionContext(96, Rounding.HalfEven, 0, 28, true);
})(PrecisionContext,PrecisionContext.prototype);

if(typeof exports!=="undefined")exports['PrecisionContext']=PrecisionContext;
if(typeof window!=="undefined")window['PrecisionContext']=PrecisionContext;

var BigNumberFlags = function(){};
(function(constructor,prototype){
    constructor.FlagNegative = 1;
    constructor.FlagQuietNaN = 4;
    constructor.FlagSignalingNaN = 8;
    constructor.FlagInfinity = 2;
    constructor.FlagSpecial = (BigNumberFlags.FlagQuietNaN | BigNumberFlags.FlagSignalingNaN | BigNumberFlags.FlagInfinity);
    constructor.FlagNaN = (BigNumberFlags.FlagQuietNaN | BigNumberFlags.FlagSignalingNaN);
    constructor.FiniteOnly = 0;
    constructor.FiniteAndNonFinite = 1;
    constructor.X3Dot274 = 2;
})(BigNumberFlags,BigNumberFlags.prototype);

var RadixMath = function(helper) {

    this.helper = helper;
    this.support = helper.GetArithmeticSupport();
    this.thisRadix = helper.GetRadix();
};
(function(constructor,prototype){
    prototype.helper = null;
    prototype.thisRadix = null;
    prototype.support = null;
    prototype.ReturnQuietNaNFastIntPrecision = function(thisValue, precision) {
        var mant = (this.helper.GetMantissa(thisValue)).abs();
        var mantChanged = false;
        if (!(mant.signum() == 0) && precision != null && precision.signum() > 0) {
            var limit = this.helper.MultiplyByRadixPower(BigInteger.ONE, precision);
            if (mant.compareTo(limit) >= 0) {
                mant = mant.remainder(limit);
                mantChanged = true;
            }
        }
        var flags = this.helper.GetFlags(thisValue);
        if (!mantChanged && (flags & BigNumberFlags.FlagQuietNaN) != 0) {
            return thisValue;
        }
        flags &= BigNumberFlags.FlagNegative;
        flags |= BigNumberFlags.FlagQuietNaN;
        return this.helper.CreateNewWithFlags(mant, BigInteger.ZERO, flags);
    };
    prototype.ReturnQuietNaN = function(thisValue, ctx) {
        var mant = (this.helper.GetMantissa(thisValue)).abs();
        var mantChanged = false;
        if (!(mant.signum() == 0) && ctx != null && !((ctx.getPrecision()).signum() == 0)) {
            var limit = this.helper.MultiplyByRadixPower(BigInteger.ONE, FastInteger.FromBig(ctx.getPrecision()));
            if (mant.compareTo(limit) >= 0) {
                mant = mant.remainder(limit);
                mantChanged = true;
            }
        }
        var flags = this.helper.GetFlags(thisValue);
        if (!mantChanged && (flags & BigNumberFlags.FlagQuietNaN) != 0) {
            return thisValue;
        }
        flags &= BigNumberFlags.FlagNegative;
        flags |= BigNumberFlags.FlagQuietNaN;
        return this.helper.CreateNewWithFlags(mant, BigInteger.ZERO, flags);
    };
    prototype.SquareRootHandleSpecial = function(thisValue, ctx) {
        var thisFlags = this.helper.GetFlags(thisValue);
        if (((thisFlags) & BigNumberFlags.FlagSpecial) != 0) {
            if ((thisFlags & BigNumberFlags.FlagSignalingNaN) != 0) {
                return this.SignalingNaNInvalid(thisValue, ctx);
            }
            if ((thisFlags & BigNumberFlags.FlagQuietNaN) != 0) {
                return this.ReturnQuietNaN(thisValue, ctx);
            }
            if ((thisFlags & BigNumberFlags.FlagInfinity) != 0) {

                if ((thisFlags & BigNumberFlags.FlagNegative) != 0) {
                    return this.SignalInvalid(ctx);
                }
                return thisValue;
            }
        }
        var sign = this.helper.GetSign(thisValue);
        if (sign < 0) {
            return this.SignalInvalid(ctx);
        }
        return null;
    };
    prototype.DivisionHandleSpecial = function(thisValue, other, ctx) {
        var thisFlags = this.helper.GetFlags(thisValue);
        var otherFlags = this.helper.GetFlags(other);
        if (((thisFlags | otherFlags) & BigNumberFlags.FlagSpecial) != 0) {
            var result = this.HandleNotANumber(thisValue, other, ctx);
            if (result != null) return result;
            if ((thisFlags & BigNumberFlags.FlagInfinity) != 0 && (otherFlags & BigNumberFlags.FlagInfinity) != 0) {

                return this.SignalInvalid(ctx);
            }
            if ((thisFlags & BigNumberFlags.FlagInfinity) != 0) {
                return this.EnsureSign(thisValue, ((thisFlags ^ otherFlags) & BigNumberFlags.FlagNegative) != 0);
            }
            if ((otherFlags & BigNumberFlags.FlagInfinity) != 0) {

                if (ctx != null && ctx.getHasExponentRange() && (ctx.getPrecision()).signum() > 0) {
                    if (ctx.getHasFlags()) {
                        ctx.setFlags(ctx.getFlags() | (PrecisionContext.FlagClamped));
                    }
                    var bigexp = ctx.getEMin();
                    var bigprec = ctx.getPrecision();
                    bigexp = bigexp.subtract(bigprec);
                    bigexp = bigexp.add(BigInteger.ONE);
                    thisFlags = ((thisFlags ^ otherFlags) & BigNumberFlags.FlagNegative);
                    return this.helper.CreateNewWithFlags(BigInteger.ZERO, bigexp, thisFlags);
                }
                thisFlags = ((thisFlags ^ otherFlags) & BigNumberFlags.FlagNegative);
                return this.RoundToPrecision(this.helper.CreateNewWithFlags(BigInteger.ZERO, BigInteger.ZERO, thisFlags), ctx);
            }
        }
        return null;
    };
    prototype.RemainderHandleSpecial = function(thisValue, other, ctx) {
        var thisFlags = this.helper.GetFlags(thisValue);
        var otherFlags = this.helper.GetFlags(other);
        if (((thisFlags | otherFlags) & BigNumberFlags.FlagSpecial) != 0) {
            var result = this.HandleNotANumber(thisValue, other, ctx);
            if (result != null) return result;
            if ((thisFlags & BigNumberFlags.FlagInfinity) != 0) {
                return this.SignalInvalid(ctx);
            }
            if ((otherFlags & BigNumberFlags.FlagInfinity) != 0) {
                return this.RoundToPrecision(thisValue, ctx);
            }
        }
        if (this.helper.GetMantissa(other).signum() == 0) {
            return this.SignalInvalid(ctx);
        }
        return null;
    };
    prototype.MinMaxHandleSpecial = function(thisValue, otherValue, ctx, isMinOp, compareAbs) {
        var thisFlags = this.helper.GetFlags(thisValue);
        var otherFlags = this.helper.GetFlags(otherValue);
        if (((thisFlags | otherFlags) & BigNumberFlags.FlagSpecial) != 0) {

            if ((this.helper.GetFlags(thisValue) & BigNumberFlags.FlagSignalingNaN) != 0) {
                return this.SignalingNaNInvalid(thisValue, ctx);
            }
            if ((this.helper.GetFlags(otherValue) & BigNumberFlags.FlagSignalingNaN) != 0) {
                return this.SignalingNaNInvalid(otherValue, ctx);
            }

            if ((this.helper.GetFlags(thisValue) & BigNumberFlags.FlagQuietNaN) != 0) {
                if ((this.helper.GetFlags(otherValue) & BigNumberFlags.FlagQuietNaN) != 0) {

                    return this.ReturnQuietNaN(thisValue, ctx);
                }

                return this.RoundToPrecision(otherValue, ctx);
            }
            if ((this.helper.GetFlags(otherValue) & BigNumberFlags.FlagQuietNaN) != 0) {

                return this.RoundToPrecision(thisValue, ctx);
            }
            if ((thisFlags & BigNumberFlags.FlagInfinity) != 0) {
                if (compareAbs && (otherFlags & BigNumberFlags.FlagInfinity) == 0) {

                    return (isMinOp) ? this.RoundToPrecision(otherValue, ctx) : thisValue;
                }

                if (isMinOp) {
                    return ((thisFlags & BigNumberFlags.FlagNegative) != 0) ? thisValue : this.RoundToPrecision(otherValue, ctx);
                } else {

                    return ((thisFlags & BigNumberFlags.FlagNegative) == 0) ? thisValue : this.RoundToPrecision(otherValue, ctx);
                }
            }

            if ((otherFlags & BigNumberFlags.FlagInfinity) != 0) {
                if (compareAbs) {

                    return (isMinOp) ? this.RoundToPrecision(thisValue, ctx) : otherValue;
                }
                if (isMinOp) {
                    return ((otherFlags & BigNumberFlags.FlagNegative) == 0) ? this.RoundToPrecision(thisValue, ctx) : otherValue;
                } else {
                    return ((otherFlags & BigNumberFlags.FlagNegative) != 0) ? this.RoundToPrecision(thisValue, ctx) : otherValue;
                }
            }
        }
        return null;
    };
    prototype.HandleNotANumber = function(thisValue, other, ctx) {
        var thisFlags = this.helper.GetFlags(thisValue);
        var otherFlags = this.helper.GetFlags(other);

        if ((thisFlags & BigNumberFlags.FlagSignalingNaN) != 0) {
            return this.SignalingNaNInvalid(thisValue, ctx);
        }
        if ((otherFlags & BigNumberFlags.FlagSignalingNaN) != 0) {
            return this.SignalingNaNInvalid(other, ctx);
        }

        if ((thisFlags & BigNumberFlags.FlagQuietNaN) != 0) {
            return this.ReturnQuietNaN(thisValue, ctx);
        }
        if ((otherFlags & BigNumberFlags.FlagQuietNaN) != 0) {
            return this.ReturnQuietNaN(other, ctx);
        }
        return null;
    };
    prototype.MultiplyAddHandleSpecial = function(op1, op2, op3, ctx) {
        var op1Flags = this.helper.GetFlags(op1);

        if ((op1Flags & BigNumberFlags.FlagSignalingNaN) != 0) {
            return this.SignalingNaNInvalid(op1, ctx);
        }
        var op2Flags = this.helper.GetFlags(op2);
        if ((op2Flags & BigNumberFlags.FlagSignalingNaN) != 0) {
            return this.SignalingNaNInvalid(op2, ctx);
        }
        var op3Flags = this.helper.GetFlags(op3);
        if ((op3Flags & BigNumberFlags.FlagSignalingNaN) != 0) {
            return this.SignalingNaNInvalid(op3, ctx);
        }

        if ((op1Flags & BigNumberFlags.FlagQuietNaN) != 0) {
            return this.ReturnQuietNaN(op1, ctx);
        }
        if ((op2Flags & BigNumberFlags.FlagQuietNaN) != 0) {
            return this.ReturnQuietNaN(op2, ctx);
        }

        if ((op1Flags & BigNumberFlags.FlagInfinity) != 0) {

            if ((op2Flags & BigNumberFlags.FlagSpecial) == 0 && this.helper.GetMantissa(op2).signum() == 0) return this.SignalInvalid(ctx);
        }
        if ((op2Flags & BigNumberFlags.FlagInfinity) != 0) {

            if ((op1Flags & BigNumberFlags.FlagSpecial) == 0 && this.helper.GetMantissa(op1).signum() == 0) return this.SignalInvalid(ctx);
        }

        if ((op3Flags & BigNumberFlags.FlagQuietNaN) != 0) {
            return this.ReturnQuietNaN(op3, ctx);
        }
        return null;
    };
    prototype.ValueOf = function(value, ctx) {
        if (ctx == null || !ctx.getHasExponentRange() || ctx.ExponentWithinRange(BigInteger.ZERO)) return this.helper.ValueOf(value);
        return this.RoundToPrecision(this.helper.ValueOf(value), ctx);
    };
    prototype.CompareToHandleSpecialReturnInt = function(thisValue, other) {
        var thisFlags = this.helper.GetFlags(thisValue);
        var otherFlags = this.helper.GetFlags(other);
        if (((thisFlags | otherFlags) & BigNumberFlags.FlagSpecial) != 0) {
            if (((thisFlags | otherFlags) & BigNumberFlags.FlagNaN) != 0) {
                throw new Error("Either operand is NaN");
            }
            if ((thisFlags & BigNumberFlags.FlagInfinity) != 0) {

                if ((thisFlags & (BigNumberFlags.FlagInfinity | BigNumberFlags.FlagNegative)) == (otherFlags & (BigNumberFlags.FlagInfinity | BigNumberFlags.FlagNegative))) return 0;
                return ((thisFlags & BigNumberFlags.FlagNegative) == 0) ? 1 : -1;
            }
            if ((otherFlags & BigNumberFlags.FlagInfinity) != 0) {

                if ((thisFlags & (BigNumberFlags.FlagInfinity | BigNumberFlags.FlagNegative)) == (otherFlags & (BigNumberFlags.FlagInfinity | BigNumberFlags.FlagNegative))) return 0;
                return ((otherFlags & BigNumberFlags.FlagNegative) == 0) ? -1 : 1;
            }
        }
        return 2;
    };
    prototype.CompareToHandleSpecial = function(thisValue, other, treatQuietNansAsSignaling, ctx) {
        var thisFlags = this.helper.GetFlags(thisValue);
        var otherFlags = this.helper.GetFlags(other);
        if (((thisFlags | otherFlags) & BigNumberFlags.FlagSpecial) != 0) {

            if ((this.helper.GetFlags(thisValue) & BigNumberFlags.FlagSignalingNaN) != 0) {
                return this.SignalingNaNInvalid(thisValue, ctx);
            }
            if ((this.helper.GetFlags(other) & BigNumberFlags.FlagSignalingNaN) != 0) {
                return this.SignalingNaNInvalid(other, ctx);
            }
            if (treatQuietNansAsSignaling) {
                if ((this.helper.GetFlags(thisValue) & BigNumberFlags.FlagQuietNaN) != 0) {
                    return this.SignalingNaNInvalid(thisValue, ctx);
                }
                if ((this.helper.GetFlags(other) & BigNumberFlags.FlagQuietNaN) != 0) {
                    return this.SignalingNaNInvalid(other, ctx);
                }
            } else {

                if ((this.helper.GetFlags(thisValue) & BigNumberFlags.FlagQuietNaN) != 0) {
                    return this.ReturnQuietNaN(thisValue, ctx);
                }
                if ((this.helper.GetFlags(other) & BigNumberFlags.FlagQuietNaN) != 0) {
                    return this.ReturnQuietNaN(other, ctx);
                }
            }
            if ((thisFlags & BigNumberFlags.FlagInfinity) != 0) {

                if ((thisFlags & (BigNumberFlags.FlagInfinity | BigNumberFlags.FlagNegative)) == (otherFlags & (BigNumberFlags.FlagInfinity | BigNumberFlags.FlagNegative))) return this.ValueOf(0, null);
                return ((thisFlags & BigNumberFlags.FlagNegative) == 0) ? this.ValueOf(1, null) : this.ValueOf(-1, null);
            }
            if ((otherFlags & BigNumberFlags.FlagInfinity) != 0) {

                if ((thisFlags & (BigNumberFlags.FlagInfinity | BigNumberFlags.FlagNegative)) == (otherFlags & (BigNumberFlags.FlagInfinity | BigNumberFlags.FlagNegative))) return this.ValueOf(0, null);
                return ((otherFlags & BigNumberFlags.FlagNegative) == 0) ? this.ValueOf(-1, null) : this.ValueOf(1, null);
            }
        }
        return null;
    };
    prototype.SignalingNaNInvalid = function(value, ctx) {
        if (ctx != null && ctx.getHasFlags()) {
            ctx.setFlags(ctx.getFlags() | (PrecisionContext.FlagInvalid));
        }
        return this.ReturnQuietNaN(value, ctx);
    };
    prototype.SignalInvalid = function(ctx) {
        if (this.support == BigNumberFlags.FiniteOnly) throw new Error("Invalid operation");
        if (ctx != null && ctx.getHasFlags()) {
            ctx.setFlags(ctx.getFlags() | (PrecisionContext.FlagInvalid));
        }
        return this.helper.CreateNewWithFlags(BigInteger.ZERO, BigInteger.ZERO, BigNumberFlags.FlagQuietNaN);
    };
    prototype.SignalInvalidWithMessage = function(ctx, str) {
        if (this.support == BigNumberFlags.FiniteOnly) throw new Error("Invalid operation");
        if (ctx != null && ctx.getHasFlags()) {
            ctx.setFlags(ctx.getFlags() | (PrecisionContext.FlagInvalid));
        }
        return this.helper.CreateNewWithFlags(BigInteger.ZERO, BigInteger.ZERO, BigNumberFlags.FlagQuietNaN);
    };
    prototype.SignalOverflow = function(neg) {
        return this.support == BigNumberFlags.FiniteOnly ? null : this.helper.CreateNewWithFlags(BigInteger.ZERO, BigInteger.ZERO, (neg ? BigNumberFlags.FlagNegative : 0) | BigNumberFlags.FlagInfinity);
    };
    prototype.SignalOverflow2 = function(pc, neg) {
        if (pc != null && pc.getHasFlags()) {
            pc.setFlags(pc.getFlags() | (PrecisionContext.FlagOverflow | PrecisionContext.FlagInexact | PrecisionContext.FlagRounded));
        }
        if (pc != null && !((pc.getPrecision()).signum() == 0) && pc.getHasExponentRange() && (pc.getRounding() == Rounding.Down || pc.getRounding() == Rounding.ZeroFiveUp || (pc.getRounding() == Rounding.Ceiling && neg) || (pc.getRounding() == Rounding.Floor && !neg))) {

            var overflowMant = BigInteger.ZERO;
            var fastPrecision = FastInteger.FromBig(pc.getPrecision());
            overflowMant = this.helper.MultiplyByRadixPower(BigInteger.ONE, fastPrecision);
            overflowMant = overflowMant.subtract(BigInteger.ONE);
            var clamp = FastInteger.FromBig(pc.getEMax()).Increment().Subtract(fastPrecision);
            return this.helper.CreateNewWithFlags(overflowMant, clamp.AsBigInteger(), neg ? BigNumberFlags.FlagNegative : 0);
        }
        return this.SignalOverflow(neg);
    };
    prototype.SignalDivideByZero = function(ctx, neg) {
        if (this.support == BigNumberFlags.FiniteOnly) throw new Error("Division by zero");
        if (ctx != null && ctx.getHasFlags()) {
            ctx.setFlags(ctx.getFlags() | (PrecisionContext.FlagDivideByZero));
        }
        return this.helper.CreateNewWithFlags(BigInteger.ZERO, BigInteger.ZERO, BigNumberFlags.FlagInfinity | (neg ? BigNumberFlags.FlagNegative : 0));
    };
    prototype.Round = function(accum, rounding, neg, fastint) {
        var incremented = false;
        var radix = this.thisRadix;
        if (rounding == Rounding.HalfUp) {
            if (accum.getLastDiscardedDigit() >= ((radix / 2)|0)) {
                incremented = true;
            }
        } else if (rounding == Rounding.HalfEven) {
            if (accum.getLastDiscardedDigit() >= ((radix / 2)|0)) {
                if (accum.getLastDiscardedDigit() > ((radix / 2)|0) || accum.getOlderDiscardedDigits() != 0) {
                    incremented = true;
                } else if (!fastint.isEvenNumber()) {
                    incremented = true;
                }
            }
        } else if (rounding == Rounding.Ceiling) {
            if (!neg && (accum.getLastDiscardedDigit() | accum.getOlderDiscardedDigits()) != 0) {
                incremented = true;
            }
        } else if (rounding == Rounding.Floor) {
            if (neg && (accum.getLastDiscardedDigit() | accum.getOlderDiscardedDigits()) != 0) {
                incremented = true;
            }
        } else if (rounding == Rounding.HalfDown) {
            if (accum.getLastDiscardedDigit() > ((radix / 2)|0) || (accum.getLastDiscardedDigit() == ((radix / 2)|0) && accum.getOlderDiscardedDigits() != 0)) {
                incremented = true;
            }
        } else if (rounding == Rounding.Up) {
            if ((accum.getLastDiscardedDigit() | accum.getOlderDiscardedDigits()) != 0) {
                incremented = true;
            }
        } else if (rounding == Rounding.ZeroFiveUp) {
            if ((accum.getLastDiscardedDigit() | accum.getOlderDiscardedDigits()) != 0) {
                if (radix == 2) {
                    incremented = true;
                } else {
                    var lastDigit = FastInteger.Copy(fastint).Mod(radix).AsInt32();
                    if (lastDigit == 0 || lastDigit == ((radix / 2)|0)) {
                        incremented = true;
                    }
                }
            }
        }
        return incremented;
    };
    prototype.RoundGivenDigits = function(lastDiscarded, olderDiscarded, rounding, neg, bigval) {
        var incremented = false;
        var radix = this.thisRadix;
        if (rounding == Rounding.HalfUp) {
            if (lastDiscarded >= ((radix / 2)|0)) {
                incremented = true;
            }
        } else if (rounding == Rounding.HalfEven) {
            if (lastDiscarded >= ((radix / 2)|0)) {
                if (lastDiscarded > ((radix / 2)|0) || olderDiscarded != 0) {
                    incremented = true;
                } else if (bigval.testBit(0)) {
                    incremented = true;
                }
            }
        } else if (rounding == Rounding.Ceiling) {
            if (!neg && (lastDiscarded | olderDiscarded) != 0) {
                incremented = true;
            }
        } else if (rounding == Rounding.Floor) {
            if (neg && (lastDiscarded | olderDiscarded) != 0) {
                incremented = true;
            }
        } else if (rounding == Rounding.HalfDown) {
            if (lastDiscarded > ((radix / 2)|0) || (lastDiscarded == ((radix / 2)|0) && olderDiscarded != 0)) {
                incremented = true;
            }
        } else if (rounding == Rounding.Up) {
            if ((lastDiscarded | olderDiscarded) != 0) {
                incremented = true;
            }
        } else if (rounding == Rounding.ZeroFiveUp) {
            if ((lastDiscarded | olderDiscarded) != 0) {
                if (radix == 2) {
                    incremented = true;
                } else {
                    var bigdigit = bigval.remainder(BigInteger.valueOf(radix));
                    var lastDigit = bigdigit.intValue();
                    if (lastDigit == 0 || lastDigit == ((radix / 2)|0)) {
                        incremented = true;
                    }
                }
            }
        }
        return incremented;
    };
    prototype.RoundGivenBigInt = function(accum, rounding, neg, bigval) {
        return this.RoundGivenDigits(accum.getLastDiscardedDigit(), accum.getOlderDiscardedDigits(), rounding, neg, bigval);
    };
    prototype.EnsureSign = function(val, negative) {
        if (val == null) return val;
        var flags = this.helper.GetFlags(val);
        if ((negative && (flags & BigNumberFlags.FlagNegative) == 0) || (!negative && (flags & BigNumberFlags.FlagNegative) != 0)) {
            flags &= ~BigNumberFlags.FlagNegative;
            flags |= (negative ? BigNumberFlags.FlagNegative : 0);
            return this.helper.CreateNewWithFlags(this.helper.GetMantissa(val), this.helper.GetExponent(val), flags);
        }
        return val;
    };

    prototype.DivideToIntegerNaturalScale = function(thisValue, divisor, ctx) {
        var desiredScale = FastInteger.FromBig(this.helper.GetExponent(thisValue)).SubtractBig(this.helper.GetExponent(divisor));
        var ctx2 = PrecisionContext.ForRounding(Rounding.Down).WithBigPrecision(ctx == null ? BigInteger.ZERO : ctx.getPrecision()).WithBlankFlags();
        var ret = this.DivideInternal(thisValue, divisor, ctx2, RadixMath.IntegerModeFixedScale, BigInteger.ZERO);
        if ((ctx2.getFlags() & (PrecisionContext.FlagInvalid | PrecisionContext.FlagDivideByZero)) != 0) {
            if (ctx.getHasFlags()) {
                ctx.setFlags(ctx.getFlags() | (PrecisionContext.FlagInvalid | PrecisionContext.FlagDivideByZero));
            }
            return ret;
        }
        var neg = (this.helper.GetSign(thisValue) < 0) ^ (this.helper.GetSign(divisor) < 0);

        if (this.helper.GetMantissa(ret).signum() == 0) {

            var dividendExp = this.helper.GetExponent(thisValue);
            var divisorExp = this.helper.GetExponent(divisor);
            ret = this.helper.CreateNewWithFlags(BigInteger.ZERO, (dividendExp.subtract(divisorExp)), this.helper.GetFlags(ret));
        } else {
            if (desiredScale.signum() < 0) {

                desiredScale.Negate();
                var bigmantissa = (this.helper.GetMantissa(ret)).abs();
                bigmantissa = this.helper.MultiplyByRadixPower(bigmantissa, desiredScale);
                ret = this.helper.CreateNewWithFlags(bigmantissa, this.helper.GetExponent(thisValue).subtract(this.helper.GetExponent(divisor)), this.helper.GetFlags(ret));
            } else if (desiredScale.signum() > 0) {

                var bigmantissa = (this.helper.GetMantissa(ret)).abs();
                var fastexponent = FastInteger.FromBig(this.helper.GetExponent(ret));
                var bigradix = BigInteger.valueOf(this.thisRadix);
                while (true) {
                    if (desiredScale.compareTo(fastexponent) == 0) break;
                    var bigrem;
                    var bigquo;
                    {
                        var divrem = (bigmantissa).divideAndRemainder(bigradix);
                        bigquo = divrem[0];
                        bigrem = divrem[1];
                    }
                    if (bigrem.signum() != 0) break;
                    bigmantissa = bigquo;
                    fastexponent.Increment();
                }
                ret = this.helper.CreateNewWithFlags(bigmantissa, fastexponent.AsBigInteger(), this.helper.GetFlags(ret));
            }
        }
        if (ctx != null) {
            ret = this.RoundToPrecision(ret, ctx);
        }
        ret = this.EnsureSign(ret, neg);
        return ret;
    };

    prototype.DivideToIntegerZeroScale = function(thisValue, divisor, ctx) {
        var ctx2 = PrecisionContext.ForRounding(Rounding.Down).WithBigPrecision(ctx == null ? BigInteger.ZERO : ctx.getPrecision()).WithBlankFlags();
        var ret = this.DivideInternal(thisValue, divisor, ctx2, RadixMath.IntegerModeFixedScale, BigInteger.ZERO);
        if ((ctx2.getFlags() & (PrecisionContext.FlagInvalid | PrecisionContext.FlagDivideByZero)) != 0) {
            if (ctx.getHasFlags()) {
                ctx.setFlags(ctx.getFlags() | (ctx2.getFlags() & (PrecisionContext.FlagInvalid | PrecisionContext.FlagDivideByZero)));
            }
            return ret;
        }
        if (ctx != null) {
            ctx2 = ctx.WithBlankFlags().WithUnlimitedExponents();
            ret = this.RoundToPrecision(ret, ctx2);
            if ((ctx2.getFlags() & PrecisionContext.FlagRounded) != 0) {
                return this.SignalInvalid(ctx);
            }
        }
        return ret;
    };

    prototype.Abs = function(value, ctx) {
        var flags = this.helper.GetFlags(value);
        if ((flags & BigNumberFlags.FlagSignalingNaN) != 0) {
            return this.SignalingNaNInvalid(value, ctx);
        }
        if ((flags & BigNumberFlags.FlagQuietNaN) != 0) {
            return this.ReturnQuietNaN(value, ctx);
        }
        if ((flags & BigNumberFlags.FlagNegative) != 0) {
            return this.RoundToPrecision(this.helper.CreateNewWithFlags(this.helper.GetMantissa(value), this.helper.GetExponent(value), flags & ~BigNumberFlags.FlagNegative), ctx);
        }
        return this.RoundToPrecision(value, ctx);
    };

    prototype.Negate = function(value, ctx) {
        var flags = this.helper.GetFlags(value);
        if ((flags & BigNumberFlags.FlagSignalingNaN) != 0) {
            return this.SignalingNaNInvalid(value, ctx);
        }
        if ((flags & BigNumberFlags.FlagQuietNaN) != 0) {
            return this.ReturnQuietNaN(value, ctx);
        }
        var mant = this.helper.GetMantissa(value);
        if ((flags & BigNumberFlags.FlagInfinity) == 0 && mant.signum() == 0) {
            if ((flags & BigNumberFlags.FlagNegative) == 0) {

                return this.RoundToPrecision(this.helper.CreateNewWithFlags(mant, this.helper.GetExponent(value), flags & ~BigNumberFlags.FlagNegative), ctx);
            } else if (ctx != null && ctx.getRounding() == Rounding.Floor) {

                return this.RoundToPrecision(this.helper.CreateNewWithFlags(mant, this.helper.GetExponent(value), flags | BigNumberFlags.FlagNegative), ctx);
            } else {
                return this.RoundToPrecision(this.helper.CreateNewWithFlags(mant, this.helper.GetExponent(value), flags & ~BigNumberFlags.FlagNegative), ctx);
            }
        }
        flags = flags ^ BigNumberFlags.FlagNegative;
        return this.RoundToPrecision(this.helper.CreateNewWithFlags(mant, this.helper.GetExponent(value), flags), ctx);
    };
    prototype.AbsRaw = function(value) {
        return this.EnsureSign(value, false);
    };
    prototype.IsNegative = function(val) {
        return (this.helper.GetFlags(val) & BigNumberFlags.FlagNegative) != 0;
    };
    prototype.NegateRaw = function(val) {
        if (val == null) return val;
        var sign = this.helper.GetFlags(val) & BigNumberFlags.FlagNegative;
        return this.helper.CreateNewWithFlags(this.helper.GetMantissa(val), this.helper.GetExponent(val), sign == 0 ? BigNumberFlags.FlagNegative : 0);
    };
    constructor.TransferFlags = function(ctxDst, ctxSrc) {
        if (ctxDst != null && ctxDst.getHasFlags()) {
            if ((ctxSrc.getFlags() & (PrecisionContext.FlagInvalid | PrecisionContext.FlagDivideByZero)) != 0) {
                ctxDst.setFlags(ctxDst.getFlags() | (ctxSrc.getFlags() & (PrecisionContext.FlagInvalid | PrecisionContext.FlagDivideByZero)));
            } else {
                ctxDst.setFlags(ctxDst.getFlags() | (ctxSrc.getFlags()));
            }
        }
    };

    prototype.Remainder = function(thisValue, divisor, ctx) {
        var ctx2 = ctx == null ? null : ctx.WithBlankFlags();
        var ret = this.RemainderHandleSpecial(thisValue, divisor, ctx2);
        if (ret != null) {
            RadixMath.TransferFlags(ctx, ctx2);
            return ret;
        }
        ret = this.DivideToIntegerZeroScale(thisValue, divisor, ctx2);
        if ((ctx2.getFlags() & PrecisionContext.FlagInvalid) != 0) {
            return this.SignalInvalid(ctx);
        }
        ret = this.Add(thisValue, this.NegateRaw(this.Multiply(ret, divisor, null)), ctx2);
        ret = this.EnsureSign(ret, (this.helper.GetFlags(thisValue) & BigNumberFlags.FlagNegative) != 0);
        RadixMath.TransferFlags(ctx, ctx2);
        return ret;
    };

    prototype.RemainderNear = function(thisValue, divisor, ctx) {
        var ctx2 = ctx == null ? PrecisionContext.ForRounding(Rounding.HalfEven).WithBlankFlags() : ctx.WithRounding(Rounding.HalfEven).WithBlankFlags();
        var ret = this.RemainderHandleSpecial(thisValue, divisor, ctx2);
        if (ret != null) {
            RadixMath.TransferFlags(ctx, ctx2);
            return ret;
        }
        ret = this.DivideInternal(thisValue, divisor, ctx2, RadixMath.IntegerModeFixedScale, BigInteger.ZERO);
        if ((ctx2.getFlags() & (PrecisionContext.FlagInvalid)) != 0) {
            return this.SignalInvalid(ctx);
        }
        ctx2 = ctx2.WithBlankFlags();
        ret = this.RoundToPrecision(ret, ctx2);
        if ((ctx2.getFlags() & (PrecisionContext.FlagRounded | PrecisionContext.FlagInvalid)) != 0) {
            return this.SignalInvalid(ctx);
        }
        ctx2 = ctx == null ? PrecisionContext.Unlimited.WithBlankFlags() : ctx.WithBlankFlags();
        var ret2 = this.Add(thisValue, this.NegateRaw(this.Multiply(ret, divisor, null)), ctx2);
        if ((ctx2.getFlags() & (PrecisionContext.FlagInvalid)) != 0) {
            return this.SignalInvalid(ctx);
        }
        if (this.helper.GetFlags(ret2) == 0 && this.helper.GetMantissa(ret2).signum() == 0) {
            ret2 = this.EnsureSign(ret2, (this.helper.GetFlags(thisValue) & BigNumberFlags.FlagNegative) != 0);
        }
        RadixMath.TransferFlags(ctx, ctx2);
        return ret2;
    };

    prototype.Pi = function(ctx) {
        if (ctx == null || (ctx.getPrecision()).signum() == 0) throw new Error("ctx is null or has unlimited precision");

        var a = this.helper.ValueOf(1);
        var ctxdiv = ctx.WithBigPrecision((ctx.getPrecision()).add(BigInteger.TEN)).WithRounding(Rounding.ZeroFiveUp);
        var two = this.helper.ValueOf(2);
        var b = this.Divide(a, this.SquareRoot(two, ctxdiv), ctxdiv);
        var four = this.helper.ValueOf(4);
        var half = ((this.thisRadix & 1) == 0) ? this.helper.CreateNewWithFlags(BigInteger.valueOf((this.thisRadix / 2)|0), BigInteger.ZERO.subtract(BigInteger.ONE), 0) : null;
        var t = this.Divide(a, four, ctxdiv);
        var more = true;
        var lastCompare = 0;
        var vacillations = 0;
        var lastGuess = null;
        var guess = null;
        var powerTwo = BigInteger.ONE;
        while (more) {
            lastGuess = guess;
            var aplusB = this.Add(a, b, null);
            var newA = (half == null) ? this.Divide(aplusB, two, ctxdiv) : this.Multiply(aplusB, half, null);
            var aMinusNewA = this.Add(a, this.NegateRaw(newA), null);
            if (!a.equals(b)) {
                var atimesB = this.Multiply(a, b, ctxdiv);
                b = this.SquareRoot(atimesB, ctxdiv);
            }
            a = newA;
            guess = this.Multiply(aplusB, aplusB, null);
            guess = this.Divide(guess, this.Multiply(t, four, null), ctxdiv);
            var newGuess = guess;
            if (lastGuess != null) {
                var guessCmp = this.compareTo(lastGuess, newGuess);
                if (guessCmp == 0) {
                    more = false;
                } else if ((guessCmp > 0 && lastCompare < 0) || (lastCompare > 0 && guessCmp < 0)) {

                    vacillations++;
                    if (vacillations > 3 && guessCmp > 0) {

                        more = false;
                    }
                }
                lastCompare = guessCmp;
            }
            if (more) {
                var tmpT = this.Multiply(aMinusNewA, aMinusNewA, null);
                tmpT = this.Multiply(tmpT, this.helper.CreateNewWithFlags(powerTwo, BigInteger.ZERO, 0), null);
                t = this.Add(t, this.NegateRaw(tmpT), ctxdiv);
                powerTwo = powerTwo.shiftLeft(1);
            }
            guess = newGuess;
        }
        return this.RoundToPrecision(guess, ctx);
    };
    prototype.ExpInternal = function(thisValue, ctx) {
        var one = this.helper.ValueOf(1);
        var ctxdiv = ctx.WithBigPrecision((ctx.getPrecision()).add(BigInteger.TEN)).WithRounding(Rounding.ZeroFiveUp);
        var bigintN = BigInteger.valueOf(2);
        var facto = BigInteger.ONE;
        var fac = one;

        var guess = this.Add(one, thisValue, null);
        var lastGuess = guess;
        var pow = thisValue;
        var more = true;
        var lastCompare = 0;
        var vacillations = 0;
        while (more) {
            lastGuess = guess;

            pow = this.Multiply(pow, thisValue, ctxdiv);
            facto = facto.multiply(bigintN);
            var tmp = this.Divide(pow, this.helper.CreateNewWithFlags(facto, BigInteger.ZERO, 0), ctxdiv);
            var newGuess = this.Add(guess, tmp, ctxdiv);
            {
                var guessCmp = this.compareTo(lastGuess, newGuess);
                if (guessCmp == 0) {
                    more = false;
                } else if ((guessCmp > 0 && lastCompare < 0) || (lastCompare > 0 && guessCmp < 0)) {

                    vacillations++;
                    if (vacillations > 3 && guessCmp > 0) {

                        more = false;
                    }
                }
                lastCompare = guessCmp;
            }
            guess = newGuess;
            if (more) {
                bigintN = bigintN.add(BigInteger.ONE);
            }
        }
        return this.RoundToPrecision(guess, ctx);
    };
    prototype.PowerIntegral = function(thisValue, powIntBig, ctx) {
        var sign = powIntBig.signum();
        var one = this.helper.ValueOf(1);
        var ctxdiv = ctx.WithBigPrecision((ctx.getPrecision()).add(BigInteger.TEN)).WithRounding(Rounding.ZeroFiveUp).WithBlankFlags();
        if (sign < 0) {

            thisValue = this.Divide(one, thisValue, ctxdiv);
            powIntBig = powIntBig.negate();
        }
        if (sign == 0) return this.RoundToPrecision(one, ctx); else if (powIntBig.equals(BigInteger.ONE)) return this.RoundToPrecision(thisValue, ctx); else if (powIntBig.equals(BigInteger.valueOf(2))) return this.Multiply(thisValue, thisValue, ctx); else if (powIntBig.equals(BigInteger.valueOf(3))) return this.Multiply(thisValue, this.Multiply(thisValue, thisValue, null), ctx);

        var r = one;
        while (powIntBig.signum() != 0) {
            if (powIntBig.testBit(0)) {
                r = this.Multiply(r, thisValue, ctxdiv);
            }
            powIntBig = powIntBig.shiftRight(1);
            if (powIntBig.signum() != 0) {
                ctxdiv.setFlags(0);
                var tmp = this.Multiply(thisValue, thisValue, ctxdiv);
                if ((ctxdiv.getFlags() & PrecisionContext.FlagOverflow) != 0) {

                    return this.SignalOverflow2(ctx, this.IsNegative(tmp));
                }
                thisValue = tmp;
            }
        }
        return this.RoundToPrecision(r, ctx);
    };
    prototype.Power = function(thisValue, pow, ctx) {
        var ret = this.HandleNotANumber(thisValue, pow, ctx);
        if (ret != null) {
            return ret;
        }
        var thisSign = this.helper.GetSign(thisValue);
        var powSign = this.helper.GetSign(pow);
        var thisFlags = this.helper.GetFlags(pow);
        var powFlags = this.helper.GetFlags(pow);
        if (thisSign == 0) {
            if (powSign > 0) return this.RoundToPrecision(this.helper.CreateNewWithFlags(BigInteger.ZERO, BigInteger.ZERO, 0), ctx); else if (powSign == 0) return this.SignalInvalid(ctx);
        }
        if (thisSign < 0 && (powFlags & BigNumberFlags.FlagInfinity) != 0) {
            return this.SignalInvalid(ctx);
        }
        var powExponent = this.helper.GetExponent(pow);
        var powInt = this.Quantize(pow, this.helper.CreateNewWithFlags(BigInteger.ZERO, BigInteger.ZERO, 0), PrecisionContext.ForRounding(Rounding.Down));
        var isPowIntegral = this.compareTo(powInt, pow) == 0;
        if (thisSign == 0 && powSign < 0) {
            var infinityFlags = BigNumberFlags.FlagInfinity;
            if ((thisFlags & BigNumberFlags.FlagNegative) != 0 && (powFlags & BigNumberFlags.FlagInfinity) != 0 && isPowIntegral) {
                var powIntMant = (this.helper.GetMantissa(powInt)).abs();
                if (!(powIntMant.testBit(0) == false)) {
                    infinityFlags |= BigNumberFlags.FlagNegative;
                }
            }
            return this.helper.CreateNewWithFlags(BigInteger.ZERO, BigInteger.ZERO, infinityFlags);
        }
        if ((!isPowIntegral || powSign < 0) && (ctx == null || (ctx.getPrecision()).signum() == 0)) throw new Error("ctx is null or has unlimited precision, and pow's exponent is not an integer or is negative");
        if (thisSign < 0 && !isPowIntegral) {
            return this.SignalInvalid(ctx);
        }
        if ((thisSign & BigNumberFlags.FlagInfinity) != 0) {
            if (powSign > 0) return thisValue; else if (powSign < 0) return this.RoundToPrecision(this.helper.CreateNewWithFlags(BigInteger.ZERO, BigInteger.ZERO, 0), ctx); else return this.RoundToPrecision(this.helper.CreateNewWithFlags(BigInteger.ONE, BigInteger.ZERO, 0), ctx);
        }
        if (powSign == 0) {
            return this.RoundToPrecision(this.helper.CreateNewWithFlags(BigInteger.ONE, BigInteger.ZERO, 0), ctx);
        }
        if (isPowIntegral) {
            var signedMant = (this.helper.GetMantissa(powInt)).abs();
            if (powSign < 0) signedMant = signedMant.negate();
            return this.PowerIntegral(thisValue, signedMant, ctx);
        }
        var ctxdiv = ctx.WithBigPrecision((ctx.getPrecision()).add(BigInteger.TEN)).WithRounding(Rounding.ZeroFiveUp).WithBlankFlags();
        var lnresult = this.Ln(thisValue, ctxdiv);
        lnresult = this.Multiply(lnresult, pow, null);
        return this.Exp(lnresult, ctx);
    };

    prototype.Log10 = function(thisValue, ctx) {
        if (ctx == null || (ctx.getPrecision()).signum() == 0) throw new Error("ctx is null or has unlimited precision");
        var flags = this.helper.GetFlags(thisValue);
        if ((flags & BigNumberFlags.FlagSignalingNaN) != 0) {

            return this.SignalingNaNInvalid(thisValue, ctx);
        }
        if ((flags & BigNumberFlags.FlagQuietNaN) != 0) {

            return this.ReturnQuietNaN(thisValue, ctx);
        }
        var sign = this.helper.GetSign(thisValue);
        if (sign < 0) return this.SignalInvalid(ctx);
        if ((flags & BigNumberFlags.FlagInfinity) != 0) {
            return thisValue;
        }
        var ctxCopy = ctx.WithRounding(Rounding.HalfEven).WithBlankFlags();
        var one = this.helper.ValueOf(1);
        if (sign == 0) {
            thisValue = this.RoundToPrecision(this.helper.CreateNewWithFlags(BigInteger.ZERO, BigInteger.ZERO, BigNumberFlags.FlagNegative | BigNumberFlags.FlagInfinity), ctxCopy);
        } else if (this.compareTo(thisValue, one) == 0) {
            thisValue = this.RoundToPrecision(this.helper.CreateNewWithFlags(BigInteger.ZERO, BigInteger.ZERO, 0), ctxCopy);
        } else {
            var mant = (this.helper.GetMantissa(thisValue)).abs();
            if (mant.equals(BigInteger.ONE)) {
                thisValue = this.RoundToPrecision(this.helper.CreateNewWithFlags(this.helper.GetExponent(thisValue), BigInteger.ZERO, BigNumberFlags.FlagNegative | BigNumberFlags.FlagInfinity), ctxCopy);
            } else {
                var ctxdiv = ctx.WithBigPrecision((ctx.getPrecision()).add(BigInteger.TEN)).WithRounding(Rounding.ZeroFiveUp).WithBlankFlags();
                var ten = this.helper.CreateNewWithFlags(BigInteger.TEN, BigInteger.ZERO, 0);
                var lnNatural = this.Ln(thisValue, ctxdiv);
                var lnTen = this.Ln(ten, ctxdiv);
                thisValue = this.Divide(lnNatural, lnTen, ctx);
            }
        }
        if (ctx.getHasFlags()) {
            ctx.setFlags(ctx.getFlags() | (ctxCopy.getFlags()));
        }
        return thisValue;
    };

    prototype.Ln = function(thisValue, ctx) {
        if (ctx == null || (ctx.getPrecision()).signum() == 0) throw new Error("ctx is null or has unlimited precision");
        var flags = this.helper.GetFlags(thisValue);
        if ((flags & BigNumberFlags.FlagSignalingNaN) != 0) {

            return this.SignalingNaNInvalid(thisValue, ctx);
        }
        if ((flags & BigNumberFlags.FlagQuietNaN) != 0) {

            return this.ReturnQuietNaN(thisValue, ctx);
        }
        var sign = this.helper.GetSign(thisValue);
        if (sign < 0) return this.SignalInvalid(ctx);
        if ((flags & BigNumberFlags.FlagInfinity) != 0) {
            return thisValue;
        }
        var ctxCopy = ctx.WithRounding(Rounding.HalfEven).WithBlankFlags();
        var one = this.helper.ValueOf(1);
        if (sign == 0) return this.helper.CreateNewWithFlags(BigInteger.ZERO, BigInteger.ZERO, BigNumberFlags.FlagNegative | BigNumberFlags.FlagInfinity); else if (this.compareTo(thisValue, one) == 0) {
            thisValue = this.RoundToPrecision(this.helper.CreateNewWithFlags(BigInteger.ZERO, BigInteger.ZERO, 0), ctxCopy);
        } else {
            throw new Error();
        }
        if (ctx.getHasFlags()) {
            ctx.setFlags(ctx.getFlags() | (ctxCopy.getFlags()));
        }
        return thisValue;
    };

    prototype.Exp = function(thisValue, ctx) {
        if (ctx == null || (ctx.getPrecision()).signum() == 0) throw new Error("ctx is null or has unlimited precision");
        var flags = this.helper.GetFlags(thisValue);
        if ((flags & BigNumberFlags.FlagSignalingNaN) != 0) {

            return this.SignalingNaNInvalid(thisValue, ctx);
        }
        if ((flags & BigNumberFlags.FlagQuietNaN) != 0) {

            return this.ReturnQuietNaN(thisValue, ctx);
        }
        var ctxCopy = ctx.WithRounding(Rounding.HalfEven).WithBlankFlags();
        if ((flags & BigNumberFlags.FlagInfinity) != 0) {
            if ((flags & BigNumberFlags.FlagNegative) != 0) {
                var retval = this.RoundToPrecision(this.helper.CreateNewWithFlags(BigInteger.ZERO, BigInteger.ZERO, 0), ctxCopy);
                if (ctx.getHasFlags()) {
                    ctx.setFlags(ctx.getFlags() | (ctxCopy.getFlags()));
                }
                return retval;
            }
            return thisValue;
        }
        var sign = this.helper.GetSign(thisValue);
        var one = this.helper.ValueOf(1);
        var ctxdiv = ctx.WithBigPrecision((ctx.getPrecision()).add(BigInteger.TEN)).WithRounding(Rounding.ZeroFiveUp).WithBlankFlags();
        if (sign == 0) {
            thisValue = this.RoundToPrecision(one, ctxCopy);
        } else if (sign < 0) {
            var val = this.Exp(this.NegateRaw(thisValue), ctxdiv);
            if ((ctxdiv.getFlags() & PrecisionContext.FlagOverflow) != 0) {

                ctxdiv.setFlags(0);
                ctxdiv = ctx.WithUnlimitedExponents();
                thisValue = this.Exp(this.NegateRaw(thisValue), ctxdiv);
            } else {
                thisValue = val;
            }
            thisValue = this.Divide(one, thisValue, ctxCopy);
            if (ctx.getHasFlags()) {
                ctx.setFlags(ctx.getFlags() | (PrecisionContext.FlagInexact | PrecisionContext.FlagRounded));
            }
        } else if (this.compareTo(thisValue, one) < 0) {
            thisValue = this.ExpInternal(thisValue, ctxCopy);
            if (ctx.getHasFlags()) {
                ctx.setFlags(ctx.getFlags() | (PrecisionContext.FlagInexact | PrecisionContext.FlagRounded));
            }
        } else {
            var intpart = this.Quantize(thisValue, one, PrecisionContext.ForRounding(Rounding.Down));
            var fracpart = this.Add(thisValue, this.NegateRaw(intpart), null);
            fracpart = this.Add(one, this.Divide(fracpart, intpart, ctxdiv), null);
            ctxdiv.setFlags(0);
            thisValue = this.ExpInternal(fracpart, ctxdiv);
            if ((ctxdiv.getFlags() & PrecisionContext.FlagUnderflow) != 0) {
                if (ctx.getHasFlags()) {
                    ctx.setFlags(ctx.getFlags() | (ctxdiv.getFlags()));
                }
            }
            if (ctx.getHasFlags()) {
                ctx.setFlags(ctx.getFlags() | (PrecisionContext.FlagInexact | PrecisionContext.FlagRounded));
            }
            thisValue = this.PowerIntegral(thisValue, this.helper.GetMantissa(intpart), ctxdiv);
            thisValue = this.RoundToPrecision(thisValue, ctxCopy);
        }
        if (ctx.getHasFlags()) {
            ctx.setFlags(ctx.getFlags() | (ctxCopy.getFlags()));
        }
        return thisValue;
    };

    prototype.SquareRootGetInitialApprox = function(n) {
        var integerPart = this.helper.GetMantissa(n);
        var length = this.helper.CreateShiftAccumulator(integerPart).GetDigitLength();
        length.AddBig(this.helper.GetExponent(n));
        if (length.isEvenNumber()) {
            length.Decrement();
        }
        length.Divide(2);
        return this.helper.CreateNewWithFlags(BigInteger.ONE, length.AsBigInteger(), 0);
    };
    prototype.SquareRootSimple = function(thisValue, ctx) {

        if (ctx == null || (ctx.getPrecision()).signum() == 0) throw new Error("ctx is null or has unlimited precision");
        var guess = this.SquareRootGetInitialApprox(thisValue);
        var lastGuess = this.helper.ValueOf(0);
        var half = this.helper.CreateNewWithFlags(BigInteger.valueOf((this.thisRadix / 2)|0), BigInteger.ZERO.subtract(BigInteger.ONE), 0);
        var ctxdiv = ctx.WithBigPrecision((ctx.getPrecision()).add(BigInteger.TEN)).WithRounding(Rounding.ZeroFiveUp);
        var one = this.helper.ValueOf(1);
        var two = this.helper.ValueOf(2);
        var three = this.helper.ValueOf(3);
        var fiMax = new FastInteger(30);
        var iterChange = ctx.getPrecision();
        iterChange = iterChange.shiftRight(7);

        fiMax.AddBig(iterChange);
        var maxIterations = fiMax.MinInt32(2147483647 - 1);

        var iterations = 0;
        var more = true;
        var lastCompare = 0;
        var vacillations = 0;
        lastGuess = thisValue;

        while (more) {
            var guess2 = null;
            var newGuess = null;
            guess2 = this.Multiply(guess, guess, null);
            guess2 = this.Multiply(thisValue, guess2, null);
            guess2 = this.Add(three, this.NegateRaw(guess2), null);
            guess2 = this.Multiply(guess, guess2, null);
            guess2 = ((this.thisRadix & 1) != 0) ? this.Divide(guess2, two, ctxdiv) : this.Multiply(guess2, half, ctxdiv);
            guess2 = this.AbsRaw(guess2);
            newGuess = this.Multiply(thisValue, guess2, ctxdiv);

            if (++iterations >= maxIterations) {
                more = false;
            } else {
                var guessCmp = this.compareTo(lastGuess, newGuess);
                if (guessCmp == 0) {
                    more = false;
                } else if ((guessCmp > 0 && lastCompare < 0) || (lastCompare > 0 && guessCmp < 0)) {

                    vacillations++;
                    if (vacillations > 3 && guessCmp > 0) {

                        more = false;
                    }
                }
                lastCompare = guessCmp;
            }
            if (!more) {
                guess = newGuess;
            } else {
                guess = guess2;
                lastGuess = newGuess;
            }
        }
        return this.RoundToPrecision(guess, ctx);
    };

    prototype.SquareRoot = function(thisValue, ctx) {
        if (ctx == null || (ctx.getPrecision()).signum() == 0) throw new Error("ctx is null or has unlimited precision");
        var ret = this.SquareRootHandleSpecial(thisValue, ctx);
        if (ret != null) {
            return ret;
        }
        var currentExp = this.helper.GetExponent(thisValue);
        var idealExp = currentExp;
        idealExp = idealExp.divide(BigInteger.valueOf(2));
        if (currentExp.signum() < 0 && currentExp.testBit(0)) {

            idealExp = idealExp.subtract(BigInteger.ONE);
        }
        if (this.helper.GetSign(thisValue) == 0) {
            return this.RoundToPrecision(this.helper.CreateNewWithFlags(BigInteger.ZERO, idealExp, this.helper.GetFlags(thisValue)), ctx);
        }
        var mantissa = (this.helper.GetMantissa(thisValue)).abs();
        var initialGuess = this.SquareRootGetInitialApprox(thisValue);
        var ctxdiv = ctx.WithBigPrecision((ctx.getPrecision()).add(BigInteger.TEN)).WithRounding(Rounding.ZeroFiveUp);
        var rounding = Rounding.HalfEven;
        var ctxtmp = ctx.WithRounding(rounding).WithBlankFlags();

        var lastGuess = this.helper.ValueOf(0);
        var half = this.helper.CreateNewWithFlags(BigInteger.valueOf((this.thisRadix / 2)|0), BigInteger.ZERO.subtract(BigInteger.ONE), 0);
        var one = this.helper.ValueOf(1);
        var two = this.helper.ValueOf(2);
        var three = this.helper.ValueOf(3);
        var guess = initialGuess;
        var fiMax = new FastInteger(30);
        var iterChange = ctx.getPrecision();
        iterChange = iterChange.shiftRight(7);

        fiMax.AddBig(iterChange);
        var maxIterations = fiMax.MinInt32(2147483647 - 1);

        var iterations = 0;
        var more = true;
        var lastCompare = 0;
        var vacillations = 0;
        var treatAsInexact = false;
        var recipsqrt = false;
        lastGuess = guess;
        while (more) {
            var guess2 = null;
            var newGuess = null;
            if (!recipsqrt) {

                guess = this.Divide(thisValue, guess, ctxdiv);
                guess = this.Add(guess, lastGuess, null);
                newGuess = ((this.thisRadix & 1) != 0) ? this.Divide(guess, two, ctxdiv) : this.Multiply(guess, half, ctxdiv);
            } else {
                guess2 = this.Multiply(guess, guess, ctxdiv);
                guess2 = this.Multiply(thisValue, guess2, ctxdiv);
                guess2 = this.Add(three, this.NegateRaw(guess2), null);
                guess2 = this.Multiply(guess, guess2, ctxdiv);
                guess2 = ((this.thisRadix & 1) != 0) ? this.Divide(guess2, two, ctxdiv) : this.Multiply(guess2, half, ctxdiv);
                guess2 = this.AbsRaw(guess2);
                newGuess = this.Multiply(thisValue, guess2, ctxdiv);
            }

            if (++iterations >= maxIterations) {
                more = false;
            } else {
                var guessCmp = this.compareTo(lastGuess, newGuess);
                if (guessCmp == 0) {
                    more = false;
                } else if ((guessCmp > 0 && lastCompare < 0) || (lastCompare > 0 && guessCmp < 0)) {

                    vacillations++;
                    if (vacillations > 3 && guessCmp > 0) {

                        more = false;
                        treatAsInexact = true;
                    }
                }
                lastCompare = guessCmp;
            }
            if (!more) {
                if (recipsqrt) {
                    guess = this.Multiply(thisValue, guess2, ctxdiv.WithRounding(treatAsInexact ? Rounding.ZeroFiveUp : rounding));
                } else {
                    guess = ((this.thisRadix & 1) != 0) ? this.Divide(guess, two, ctxdiv.WithRounding(treatAsInexact ? Rounding.ZeroFiveUp : rounding)) : this.Multiply(guess, half, ctxdiv.WithRounding(treatAsInexact ? Rounding.ZeroFiveUp : rounding));
                }
            } else {
                if (recipsqrt) {
                    guess = guess2;
                    lastGuess = newGuess;
                } else {
                    guess = newGuess;
                    lastGuess = newGuess;
                }
            }
        }

        ctxdiv = ctxdiv.WithBlankFlags();
        guess = this.ReduceToPrecisionAndIdealExponent(guess, ctxdiv, FastInteger.FromBig(ctx.getPrecision()), FastInteger.FromBig(idealExp));
        currentExp = this.helper.GetExponent(guess);
        var cmp = currentExp.compareTo(idealExp);

        if (cmp > 0) {

            guess = this.Add(guess, this.helper.CreateNewWithFlags(BigInteger.ZERO, idealExp, 0), ctxtmp);
            if (ctx.getHasFlags()) {
                ctx.setFlags(ctx.getFlags() | (ctxtmp.getFlags()));
            }
            return guess;
        } else if (cmp < 0) {

            guess = this.RoundToPrecision(guess, ctxtmp);
            if (ctx.getHasFlags() && this.helper.GetExponent(guess).compareTo(idealExp) > 0) {

                ctx.setFlags(ctx.getFlags() | (PrecisionContext.FlagRounded));
            }
            if (treatAsInexact) {
                ctxtmp.setFlags(ctxtmp.getFlags() | (PrecisionContext.FlagInexact));
                ctxtmp.setFlags(ctxtmp.getFlags() | (PrecisionContext.FlagRounded));
            }
            if ((ctxtmp.getFlags() & PrecisionContext.FlagInexact) == 0) {
                ctxtmp.setFlags(0);
                guess = this.ReduceToPrecisionAndIdealExponent(guess, ctxtmp, null, FastInteger.FromBig(idealExp));
                if (ctx.getHasFlags()) {
                    ctx.setFlags(ctx.getFlags() | (ctxtmp.getFlags() & (PrecisionContext.FlagSubnormal)));
                }
                if (ctx.getHasFlags() && ctx.getClampNormalExponents() && !this.helper.GetExponent(guess).equals(idealExp)) {
                    ctx.setFlags(ctx.getFlags() | (PrecisionContext.FlagClamped));
                }
            } else {
                if (ctx.getHasFlags()) {
                    ctx.setFlags(ctx.getFlags() | (ctxtmp.getFlags()));
                }
            }
            return guess;
        } else {
            guess = this.RoundToPrecision(guess, ctxtmp);
            if (ctx.getHasFlags()) {
                ctx.setFlags(ctx.getFlags() | (ctxtmp.getFlags()));
            }
            return guess;
        }
    };

    prototype.NextMinus = function(thisValue, ctx) {
        if ((ctx) == null) throw new Error("ctx");
        if ((ctx.getPrecision()).signum() <= 0) throw new Error("ctx.getPrecision()" + " not less than " + "0" + " (" + (ctx.getPrecision()) + ")");
        if (!(ctx.getHasExponentRange())) throw new Error("doesn't satisfy ctx.getHasExponentRange()");
        var flags = this.helper.GetFlags(thisValue);
        if ((flags & BigNumberFlags.FlagSignalingNaN) != 0) {
            return this.SignalingNaNInvalid(thisValue, ctx);
        }
        if ((flags & BigNumberFlags.FlagQuietNaN) != 0) {
            return this.ReturnQuietNaN(thisValue, ctx);
        }
        if ((flags & BigNumberFlags.FlagInfinity) != 0) {
            if ((flags & BigNumberFlags.FlagNegative) != 0) {
                return thisValue;
            } else {
                var bigexp2 = ctx.getEMax();
                var bigprec = ctx.getPrecision();
                bigexp2 = bigexp2.add(BigInteger.ONE);
                bigexp2 = bigexp2.subtract(bigprec);
                var overflowMant = this.helper.MultiplyByRadixPower(BigInteger.ONE, FastInteger.FromBig(ctx.getPrecision()));
                overflowMant = overflowMant.subtract(BigInteger.ONE);
                return this.helper.CreateNewWithFlags(overflowMant, bigexp2, 0);
            }
        }
        var minexp = FastInteger.FromBig(ctx.getEMin()).SubtractBig(ctx.getPrecision()).Increment();
        var bigexp = FastInteger.FromBig(this.helper.GetExponent(thisValue));
        if (bigexp.compareTo(minexp) <= 0) {

            minexp = FastInteger.Copy(bigexp).SubtractInt(2);
        }
        var quantum = this.helper.CreateNewWithFlags(BigInteger.ONE, minexp.AsBigInteger(), BigNumberFlags.FlagNegative);
        var ctx2;
        ctx2 = ctx.WithRounding(Rounding.Floor);
        return this.Add(thisValue, quantum, ctx2);
    };

    prototype.NextToward = function(thisValue, otherValue, ctx) {
        if ((ctx) == null) throw new Error("ctx");
        if ((ctx.getPrecision()).signum() <= 0) throw new Error("ctx.getPrecision()" + " not less than " + "0" + " (" + (ctx.getPrecision()) + ")");
        if (!(ctx.getHasExponentRange())) throw new Error("doesn't satisfy ctx.getHasExponentRange()");
        var thisFlags = this.helper.GetFlags(thisValue);
        var otherFlags = this.helper.GetFlags(otherValue);
        if (((thisFlags | otherFlags) & BigNumberFlags.FlagSpecial) != 0) {
            var result = this.HandleNotANumber(thisValue, otherValue, ctx);
            if (result != null) return result;
        }
        var ctx2;
        var cmp = this.compareTo(thisValue, otherValue);
        if (cmp == 0) {
            return this.RoundToPrecision(this.EnsureSign(thisValue, (otherFlags & BigNumberFlags.FlagNegative) != 0), ctx.WithNoFlags());
        } else {
            if ((thisFlags & BigNumberFlags.FlagInfinity) != 0) {
                if ((thisFlags & (BigNumberFlags.FlagInfinity | BigNumberFlags.FlagNegative)) == (otherFlags & (BigNumberFlags.FlagInfinity | BigNumberFlags.FlagNegative))) {

                    return thisValue;
                } else {
                    var bigexp2 = ctx.getEMax();
                    var bigprec = ctx.getPrecision();
                    bigexp2 = bigexp2.add(BigInteger.ONE);
                    bigexp2 = bigexp2.subtract(bigprec);
                    var overflowMant = this.helper.MultiplyByRadixPower(BigInteger.ONE, FastInteger.FromBig(ctx.getPrecision()));
                    overflowMant = overflowMant.subtract(BigInteger.ONE);
                    return this.helper.CreateNewWithFlags(overflowMant, bigexp2, thisFlags & BigNumberFlags.FlagNegative);
                }
            }
            var minexp = FastInteger.FromBig(ctx.getEMin()).SubtractBig(ctx.getPrecision()).Increment();
            var bigexp = FastInteger.FromBig(this.helper.GetExponent(thisValue));
            if (bigexp.compareTo(minexp) < 0) {

                minexp = FastInteger.Copy(bigexp).SubtractInt(2);
            } else {

                minexp.SubtractInt(2);
            }
            var quantum = this.helper.CreateNewWithFlags(BigInteger.ONE, minexp.AsBigInteger(), (cmp > 0) ? BigNumberFlags.FlagNegative : 0);
            var val = thisValue;
            ctx2 = ctx.WithRounding((cmp > 0) ? Rounding.Floor : Rounding.Ceiling).WithBlankFlags();
            val = this.Add(val, quantum, ctx2);
            if ((ctx2.getFlags() & (PrecisionContext.FlagOverflow | PrecisionContext.FlagUnderflow)) == 0) {

                ctx2.setFlags(0);
            }
            if ((ctx2.getFlags() & (PrecisionContext.FlagUnderflow)) != 0) {
                var bigmant = (this.helper.GetMantissa(val)).abs();
                var maxmant = this.helper.MultiplyByRadixPower(BigInteger.ONE, FastInteger.FromBig(ctx.getPrecision()).Decrement());
                if (bigmant.compareTo(maxmant) >= 0 || (ctx.getPrecision()).compareTo(BigInteger.ONE) == 0) {

                    ctx2.setFlags(0);
                }
            }
            if (ctx.getHasFlags()) {
                ctx.setFlags(ctx.getFlags() | (ctx2.getFlags()));
            }
            return val;
        }
    };

    prototype.NextPlus = function(thisValue, ctx) {
        if ((ctx) == null) throw new Error("ctx");
        if ((ctx.getPrecision()).signum() <= 0) throw new Error("ctx.getPrecision()" + " not less than " + "0" + " (" + (ctx.getPrecision()) + ")");
        if (!(ctx.getHasExponentRange())) throw new Error("doesn't satisfy ctx.getHasExponentRange()");
        var flags = this.helper.GetFlags(thisValue);
        if ((flags & BigNumberFlags.FlagSignalingNaN) != 0) {
            return this.SignalingNaNInvalid(thisValue, ctx);
        }
        if ((flags & BigNumberFlags.FlagQuietNaN) != 0) {
            return this.ReturnQuietNaN(thisValue, ctx);
        }
        if ((flags & BigNumberFlags.FlagInfinity) != 0) {
            if ((flags & BigNumberFlags.FlagNegative) != 0) {
                var bigexp2 = ctx.getEMax();
                var bigprec = ctx.getPrecision();
                bigexp2 = bigexp2.add(BigInteger.ONE);
                bigexp2 = bigexp2.subtract(bigprec);
                var overflowMant = this.helper.MultiplyByRadixPower(BigInteger.ONE, FastInteger.FromBig(ctx.getPrecision()));
                overflowMant = overflowMant.subtract(BigInteger.ONE);
                return this.helper.CreateNewWithFlags(overflowMant, bigexp2, BigNumberFlags.FlagNegative);
            } else {
                return thisValue;
            }
        }
        var minexp = FastInteger.FromBig(ctx.getEMin()).SubtractBig(ctx.getPrecision()).Increment();
        var bigexp = FastInteger.FromBig(this.helper.GetExponent(thisValue));
        if (bigexp.compareTo(minexp) <= 0) {

            minexp = FastInteger.Copy(bigexp).SubtractInt(2);
        }
        var quantum = this.helper.CreateNewWithFlags(BigInteger.ONE, minexp.AsBigInteger(), 0);
        var ctx2;
        var val = thisValue;
        ctx2 = ctx.WithRounding(Rounding.Ceiling);
        return this.Add(val, quantum, ctx2);
    };

    prototype.DivideToExponent = function(thisValue, divisor, desiredExponent, ctx) {
        if (ctx != null && !ctx.ExponentWithinRange(desiredExponent)) return this.SignalInvalidWithMessage(ctx, "Exponent not within exponent range: " + desiredExponent.toString());
        var ctx2 = (ctx == null) ? PrecisionContext.ForRounding(Rounding.HalfDown) : ctx.WithUnlimitedExponents().WithPrecision(0);
        var ret = this.DivideInternal(thisValue, divisor, ctx2, RadixMath.IntegerModeFixedScale, desiredExponent);
        if (ctx != null && ctx.getHasFlags()) {
            ctx.setFlags(ctx.getFlags() | (ctx2.getFlags()));
        }
        return ret;
    };

    prototype.Divide = function(thisValue, divisor, ctx) {
        return this.DivideInternal(thisValue, divisor, ctx, RadixMath.IntegerModeRegular, BigInteger.ZERO);
    };
    prototype.RoundToScaleStatus = function(remainder, divisor, neg, ctx) {

        var rounding = (ctx == null) ? Rounding.HalfEven : ctx.getRounding();
        var lastDiscarded = 0;
        var olderDiscarded = 0;
        if (!(remainder.signum() == 0)) {
            if (rounding == Rounding.HalfDown || rounding == Rounding.HalfUp || rounding == Rounding.HalfEven) {
                var halfDivisor = (divisor.shiftRight(1));
                var cmpHalf = remainder.compareTo(halfDivisor);
                if ((cmpHalf == 0) && divisor.testBit(0) == false) {

                    lastDiscarded = ((this.thisRadix / 2)|0);
                    olderDiscarded = 0;
                } else if (cmpHalf > 0) {

                    lastDiscarded = ((this.thisRadix / 2)|0);
                    olderDiscarded = 1;
                } else {

                    lastDiscarded = 0;
                    olderDiscarded = 1;
                }
            } else {

                if (rounding == Rounding.Unnecessary) throw new Error("Rounding was required");
                lastDiscarded = 1;
                olderDiscarded = 1;
            }
        }
        return [lastDiscarded, olderDiscarded];
    };
    prototype.RoundToScale = function(mantissa, remainder, divisor, shift, neg, ctx) {

        var accum;
        var rounding = (ctx == null) ? Rounding.HalfEven : ctx.getRounding();
        var lastDiscarded = 0;
        var olderDiscarded = 0;
        if (!(remainder.signum() == 0)) {
            if (rounding == Rounding.HalfDown || rounding == Rounding.HalfUp || rounding == Rounding.HalfEven) {
                var halfDivisor = (divisor.shiftRight(1));
                var cmpHalf = remainder.compareTo(halfDivisor);
                if ((cmpHalf == 0) && divisor.testBit(0) == false) {

                    lastDiscarded = ((this.thisRadix / 2)|0);
                    olderDiscarded = 0;
                } else if (cmpHalf > 0) {

                    lastDiscarded = ((this.thisRadix / 2)|0);
                    olderDiscarded = 1;
                } else {

                    lastDiscarded = 0;
                    olderDiscarded = 1;
                }
            } else {

                if (rounding == Rounding.Unnecessary) throw new Error("Rounding was required");
                lastDiscarded = 1;
                olderDiscarded = 1;
            }
        }
        var flags = 0;
        var newmantissa = mantissa;
        if (shift.isValueZero()) {
            if ((lastDiscarded | olderDiscarded) != 0) {
                flags |= PrecisionContext.FlagInexact | PrecisionContext.FlagRounded;
                if (rounding == Rounding.Unnecessary) throw new Error("Rounding was required");
                if (this.RoundGivenDigits(lastDiscarded, olderDiscarded, rounding, neg, newmantissa)) {
                    newmantissa = newmantissa.add(BigInteger.ONE);
                }
            }
        } else {
            accum = this.helper.CreateShiftAccumulatorWithDigits(mantissa, lastDiscarded, olderDiscarded);
            accum.ShiftRight(shift);
            newmantissa = accum.getShiftedInt();
            if ((accum.getDiscardedDigitCount()).signum() != 0 || (accum.getLastDiscardedDigit() | accum.getOlderDiscardedDigits()) != 0) {
                if (mantissa.signum() != 0) flags |= PrecisionContext.FlagRounded;
                if ((accum.getLastDiscardedDigit() | accum.getOlderDiscardedDigits()) != 0) {
                    flags |= PrecisionContext.FlagInexact | PrecisionContext.FlagRounded;
                    if (rounding == Rounding.Unnecessary) throw new Error("Rounding was required");
                }
                if (this.RoundGivenBigInt(accum, rounding, neg, newmantissa)) {
                    newmantissa = newmantissa.add(BigInteger.ONE);
                }
            }
        }
        if (ctx.getHasFlags()) {
            ctx.setFlags(ctx.getFlags() | (flags));
        }
        if (neg) {
            newmantissa = newmantissa.negate();
        }
        return newmantissa;
    };
    constructor.IntegerModeFixedScale = 1;
    constructor.IntegerModeRegular = 0;
    constructor.NonTerminatingCheckThreshold = 5;
    prototype.DivideInternal = function(thisValue, divisor, ctx, integerMode, desiredExponent) {
        var ret = this.DivisionHandleSpecial(thisValue, divisor, ctx);
        if (ret != null) return ret;
        var signA = this.helper.GetSign(thisValue);
        var signB = this.helper.GetSign(divisor);
        if (signB == 0) {
            if (signA == 0) {
                return this.SignalInvalid(ctx);
            }
            return this.SignalDivideByZero(ctx, ((this.helper.GetFlags(thisValue) & BigNumberFlags.FlagNegative) != 0) ^ ((this.helper.GetFlags(divisor) & BigNumberFlags.FlagNegative) != 0));
        }
        var radix = this.thisRadix;
        if (signA == 0) {
            var retval = null;
            if (integerMode == RadixMath.IntegerModeFixedScale) {
                var newflags = (this.helper.GetFlags(thisValue) & BigNumberFlags.FlagNegative) ^ (this.helper.GetFlags(divisor) & BigNumberFlags.FlagNegative);
                retval = this.helper.CreateNewWithFlags(BigInteger.ZERO, desiredExponent, newflags);
            } else {
                var dividendExp = this.helper.GetExponent(thisValue);
                var divisorExp = this.helper.GetExponent(divisor);
                var newflags = (this.helper.GetFlags(thisValue) & BigNumberFlags.FlagNegative) ^ (this.helper.GetFlags(divisor) & BigNumberFlags.FlagNegative);
                retval = this.RoundToPrecision(this.helper.CreateNewWithFlags(BigInteger.ZERO, (dividendExp.subtract(divisorExp)), newflags), ctx);
            }
            return retval;
        } else {
            var mantissaDividend = (this.helper.GetMantissa(thisValue)).abs();
            var mantissaDivisor = (this.helper.GetMantissa(divisor)).abs();
            var expDividend = FastInteger.FromBig(this.helper.GetExponent(thisValue));
            var expDivisor = FastInteger.FromBig(this.helper.GetExponent(divisor));
            var expdiff = FastInteger.Copy(expDividend).Subtract(expDivisor);
            var adjust = new FastInteger(0);
            var result = new FastInteger(0);
            var naturalExponent = FastInteger.Copy(expdiff);
            var hasPrecision = ctx != null && (ctx.getPrecision()).signum() != 0;
            var resultNeg = (this.helper.GetFlags(thisValue) & BigNumberFlags.FlagNegative) != (this.helper.GetFlags(divisor) & BigNumberFlags.FlagNegative);
            var fastPrecision = (!hasPrecision) ? new FastInteger(0) : FastInteger.FromBig(ctx.getPrecision());
            var dividendPrecision = null;
            var divisorPrecision = null;
            if (integerMode == RadixMath.IntegerModeFixedScale) {
                var shift;
                var rem;
                var fastDesiredExponent = FastInteger.FromBig(desiredExponent);
                if (ctx != null && ctx.getHasFlags() && fastDesiredExponent.compareTo(naturalExponent) > 0) {

                    ctx.setFlags(ctx.getFlags() | (PrecisionContext.FlagRounded));
                }
                if (expdiff.compareTo(fastDesiredExponent) <= 0) {
                    shift = FastInteger.Copy(fastDesiredExponent).Subtract(expdiff);
                    var quo;
                    {
                        var divrem = (mantissaDividend).divideAndRemainder(mantissaDivisor);
                        quo = divrem[0];
                        rem = divrem[1];
                    }
                    quo = this.RoundToScale(quo, rem, mantissaDivisor, shift, resultNeg, ctx);
                    return this.helper.CreateNewWithFlags(quo, desiredExponent, resultNeg ? BigNumberFlags.FlagNegative : 0);
                } else if (ctx != null && (ctx.getPrecision()).signum() != 0 && FastInteger.Copy(expdiff).SubtractInt(8).compareTo(fastPrecision) > 0) {

                    return this.SignalInvalidWithMessage(ctx, "Result can't fit the precision");
                } else {
                    shift = FastInteger.Copy(expdiff).Subtract(fastDesiredExponent);
                    mantissaDividend = this.helper.MultiplyByRadixPower(mantissaDividend, shift);
                    var quo;
                    {
                        var divrem = (mantissaDividend).divideAndRemainder(mantissaDivisor);
                        quo = divrem[0];
                        rem = divrem[1];
                    }
                    quo = this.RoundToScale(quo, rem, mantissaDivisor, new FastInteger(0), resultNeg, ctx);
                    return this.helper.CreateNewWithFlags(quo, desiredExponent, resultNeg ? BigNumberFlags.FlagNegative : 0);
                }
            }
            if (integerMode == RadixMath.IntegerModeRegular) {
                var rem;
                var quo;
                {
                    var divrem = (mantissaDividend).divideAndRemainder(mantissaDivisor);
                    quo = divrem[0];
                    rem = divrem[1];
                }
                if (rem.signum() == 0) {
                    quo = this.RoundToScale(quo, rem, mantissaDivisor, new FastInteger(0), resultNeg, ctx);
                    return this.RoundToPrecision(this.helper.CreateNewWithFlags(quo, naturalExponent.AsBigInteger(), resultNeg ? BigNumberFlags.FlagNegative : 0), ctx);
                }
                if (hasPrecision) {
                    var divid = mantissaDividend;
                    var shift = FastInteger.FromBig(ctx.getPrecision());
                    dividendPrecision = this.helper.CreateShiftAccumulator(mantissaDividend).GetDigitLength();
                    divisorPrecision = this.helper.CreateShiftAccumulator(mantissaDivisor).GetDigitLength();
                    if (dividendPrecision.compareTo(divisorPrecision) <= 0) {
                        divisorPrecision.Subtract(dividendPrecision);
                        divisorPrecision.Increment();
                        shift.Add(divisorPrecision);
                        divid = this.helper.MultiplyByRadixPower(divid, shift);
                    } else {

                        dividendPrecision.Subtract(divisorPrecision);
                        if (dividendPrecision.compareTo(shift) <= 0) {
                            shift.Subtract(dividendPrecision);
                            shift.Increment();
                            divid = this.helper.MultiplyByRadixPower(divid, shift);
                        } else {

                            shift.SetInt(0);
                        }
                    }
                    dividendPrecision = this.helper.CreateShiftAccumulator(divid).GetDigitLength();
                    divisorPrecision = this.helper.CreateShiftAccumulator(mantissaDivisor).GetDigitLength();
                    if (shift.signum() != 0) {

                        {
                            var divrem = (divid).divideAndRemainder(mantissaDivisor);
                            quo = divrem[0];
                            rem = divrem[1];
                        }
                    }
                    var digitStatus = this.RoundToScaleStatus(rem, mantissaDivisor, resultNeg, ctx);
                    var natexp = FastInteger.Copy(naturalExponent).Subtract(shift);
                    var ctxcopy = (ctx == null) ? PrecisionContext.Unlimited.WithBlankFlags() : ctx.WithBlankFlags();
                    var retval2 = this.RoundToPrecisionWithShift(this.helper.CreateNewWithFlags(quo, natexp.AsBigInteger(), (resultNeg ? BigNumberFlags.FlagNegative : 0)), ctxcopy, digitStatus[0], digitStatus[1], new FastInteger(0), false);
                    if ((ctxcopy.getFlags() & PrecisionContext.FlagInexact) != 0) {
                        if (ctx != null && ctx.getHasFlags()) ctx.setFlags(ctx.getFlags() | (ctxcopy.getFlags()));
                        return retval2;
                    } else {
                        if (ctx != null && ctx.getHasFlags()) ctx.setFlags(ctx.getFlags() | (ctxcopy.getFlags()));
                        if (ctx != null && ctx.getHasFlags()) ctx.setFlags(ctx.getFlags() & ~(PrecisionContext.FlagRounded));
                        return this.ReduceToPrecisionAndIdealExponent(retval2, ctx, rem.signum() == 0 ? null : fastPrecision, expdiff);
                    }
                }
            }

            var resultPrecision = new FastInteger(1);
            var mantcmp = mantissaDividend.compareTo(mantissaDivisor);
            if (mantcmp < 0) {

                dividendPrecision = this.helper.CreateShiftAccumulator(mantissaDividend).GetDigitLength();
                divisorPrecision = this.helper.CreateShiftAccumulator(mantissaDivisor).GetDigitLength();
                divisorPrecision.Subtract(dividendPrecision);
                if (divisorPrecision.isValueZero()) divisorPrecision.Increment();

                mantissaDividend = this.helper.MultiplyByRadixPower(mantissaDividend, divisorPrecision);
                adjust.Add(divisorPrecision);
                if (mantissaDividend.compareTo(mantissaDivisor) < 0) {

                    if (radix == 2) {
                        mantissaDividend = mantissaDividend.shiftLeft(1);
                    } else {
                        mantissaDividend = mantissaDividend.multiply(BigInteger.valueOf(radix));
                    }
                    adjust.Increment();
                }
            } else if (mantcmp > 0) {

                dividendPrecision = this.helper.CreateShiftAccumulator(mantissaDividend).GetDigitLength();
                divisorPrecision = this.helper.CreateShiftAccumulator(mantissaDivisor).GetDigitLength();
                dividendPrecision.Subtract(divisorPrecision);
                var oldMantissaB = mantissaDivisor;
                mantissaDivisor = this.helper.MultiplyByRadixPower(mantissaDivisor, dividendPrecision);
                adjust.Subtract(dividendPrecision);
                if (mantissaDividend.compareTo(mantissaDivisor) < 0) {

                    if (dividendPrecision.CompareToInt(1) == 0) {

                        mantissaDivisor = oldMantissaB;
                    } else {
                        var bigpow = BigInteger.valueOf(radix);
                        mantissaDivisor = mantissaDivisor.divide(bigpow);
                    }
                    adjust.Increment();
                }
            }
            if (mantcmp == 0) {
                result = new FastInteger(1);
                mantissaDividend = BigInteger.ZERO;
            } else {
                {
                    if (!this.helper.HasTerminatingRadixExpansion(mantissaDividend, mantissaDivisor)) {
                        throw new Error("Result would have a nonterminating expansion");
                    }
                    var divs = FastInteger.FromBig(mantissaDivisor);
                    var divd = FastInteger.FromBig(mantissaDividend);
                    var divisorFits = divs.CanFitInInt32();
                    var smallDivisor = (divisorFits ? divs.AsInt32() : 0);
                    var halfRadix = ((radix / 2)|0);
                    var divsHalfRadix = null;
                    if (radix != 2) {
                        divsHalfRadix = FastInteger.FromBig(mantissaDivisor).Multiply(halfRadix);
                    }
                    while (true) {
                        var remainderZero = false;
                        var count = 0;
                        if (divd.CanFitInInt32()) {
                            if (divisorFits) {
                                var smallDividend = divd.AsInt32();
                                count = ((smallDividend / smallDivisor)|0);
                                divd.SetInt(smallDividend % smallDivisor);
                            } else {
                                count = 0;
                            }
                        } else {
                            if (divsHalfRadix != null) {
                                count = count + (halfRadix * divd.RepeatedSubtract(divsHalfRadix));
                            }
                            count = count + (divd.RepeatedSubtract(divs));
                        }
                        result.AddInt(count);
                        remainderZero = (divd.isValueZero());
                        if (remainderZero && adjust.signum() >= 0) {
                            mantissaDividend = divd.AsBigInteger();
                            break;
                        }
                        adjust.Increment();
                        result.Multiply(radix);
                        divd.Multiply(radix);
                    }
                }
            }

            var exp = FastInteger.Copy(expdiff).Subtract(adjust);
            var rounding = (ctx == null) ? Rounding.HalfEven : ctx.getRounding();
            var lastDiscarded = 0;
            var olderDiscarded = 0;
            if (!(mantissaDividend.signum() == 0)) {
                if (rounding == Rounding.HalfDown || rounding == Rounding.HalfEven || rounding == Rounding.HalfUp) {
                    var halfDivisor = (mantissaDivisor.shiftRight(1));
                    var cmpHalf = mantissaDividend.compareTo(halfDivisor);
                    if ((cmpHalf == 0) && mantissaDivisor.testBit(0) == false) {

                        lastDiscarded = ((radix / 2)|0);
                        olderDiscarded = 0;
                    } else if (cmpHalf > 0) {

                        lastDiscarded = ((radix / 2)|0);
                        olderDiscarded = 1;
                    } else {

                        lastDiscarded = 0;
                        olderDiscarded = 1;
                    }
                } else {
                    if (rounding == Rounding.Unnecessary) throw new Error("Rounding was required");
                    lastDiscarded = 1;
                    olderDiscarded = 1;
                }
            }
            var bigResult = result.AsBigInteger();
            var posBigResult = bigResult;
            if (ctx != null && ctx.getHasFlags() && exp.compareTo(expdiff) > 0) {

                ctx.setFlags(ctx.getFlags() | (PrecisionContext.FlagRounded));
            }
            var bigexp = exp.AsBigInteger();
            var retval = this.helper.CreateNewWithFlags(bigResult, bigexp, resultNeg ? BigNumberFlags.FlagNegative : 0);
            return this.RoundToPrecisionWithShift(retval, ctx, lastDiscarded, olderDiscarded, new FastInteger(0), false);
        }
    };

    prototype.MinMagnitude = function(a, b, ctx) {
        if (a == null) throw new Error("a");
        if (b == null) throw new Error("b");

        var result = this.MinMaxHandleSpecial(a, b, ctx, true, true);
        if (result != null) return result;
        var cmp = this.compareTo(this.AbsRaw(a), this.AbsRaw(b));
        if (cmp == 0) return this.Min(a, b, ctx);
        return (cmp < 0) ? this.RoundToPrecision(a, ctx) : this.RoundToPrecision(b, ctx);
    };

    prototype.MaxMagnitude = function(a, b, ctx) {
        if (a == null) throw new Error("a");
        if (b == null) throw new Error("b");

        var result = this.MinMaxHandleSpecial(a, b, ctx, false, true);
        if (result != null) return result;
        var cmp = this.compareTo(this.AbsRaw(a), this.AbsRaw(b));
        if (cmp == 0) return this.Max(a, b, ctx);
        return (cmp > 0) ? this.RoundToPrecision(a, ctx) : this.RoundToPrecision(b, ctx);
    };

    prototype.Max = function(a, b, ctx) {
        if (a == null) throw new Error("a");
        if (b == null) throw new Error("b");

        var result = this.MinMaxHandleSpecial(a, b, ctx, false, false);
        if (result != null) return result;
        var cmp = this.compareTo(a, b);
        if (cmp != 0) return cmp < 0 ? this.RoundToPrecision(b, ctx) : this.RoundToPrecision(a, ctx);
        var flagNegA = (this.helper.GetFlags(a) & BigNumberFlags.FlagNegative);
        if (flagNegA != (this.helper.GetFlags(b) & BigNumberFlags.FlagNegative)) {
            return (flagNegA != 0) ? this.RoundToPrecision(b, ctx) : this.RoundToPrecision(a, ctx);
        }
        if (flagNegA == 0) {
            return this.helper.GetExponent(a).compareTo(this.helper.GetExponent(b)) > 0 ? this.RoundToPrecision(a, ctx) : this.RoundToPrecision(b, ctx);
        } else {
            return this.helper.GetExponent(a).compareTo(this.helper.GetExponent(b)) > 0 ? this.RoundToPrecision(b, ctx) : this.RoundToPrecision(a, ctx);
        }
    };

    prototype.Min = function(a, b, ctx) {
        if (a == null) throw new Error("a");
        if (b == null) throw new Error("b");

        var result = this.MinMaxHandleSpecial(a, b, ctx, true, false);
        if (result != null) return result;
        var cmp = this.compareTo(a, b);
        if (cmp != 0) return cmp > 0 ? this.RoundToPrecision(b, ctx) : this.RoundToPrecision(a, ctx);
        var signANeg = this.helper.GetFlags(a) & BigNumberFlags.FlagNegative;
        if (signANeg != (this.helper.GetFlags(b) & BigNumberFlags.FlagNegative)) {
            return (signANeg != 0) ? this.RoundToPrecision(a, ctx) : this.RoundToPrecision(b, ctx);
        }
        if (signANeg == 0) {
            return (this.helper.GetExponent(a)).compareTo(this.helper.GetExponent(b)) > 0 ? this.RoundToPrecision(b, ctx) : this.RoundToPrecision(a, ctx);
        } else {
            return (this.helper.GetExponent(a)).compareTo(this.helper.GetExponent(b)) > 0 ? this.RoundToPrecision(a, ctx) : this.RoundToPrecision(b, ctx);
        }
    };

    prototype.Multiply = function(thisValue, other, ctx) {
        var thisFlags = this.helper.GetFlags(thisValue);
        var otherFlags = this.helper.GetFlags(other);
        if (((thisFlags | otherFlags) & BigNumberFlags.FlagSpecial) != 0) {
            var result = this.HandleNotANumber(thisValue, other, ctx);
            if (result != null) return result;
            if ((thisFlags & BigNumberFlags.FlagInfinity) != 0) {

                if ((otherFlags & BigNumberFlags.FlagSpecial) == 0 && this.helper.GetMantissa(other).signum() == 0) return this.SignalInvalid(ctx);
                return this.EnsureSign(thisValue, ((thisFlags & BigNumberFlags.FlagNegative) ^ (otherFlags & BigNumberFlags.FlagNegative)) != 0);
            }
            if ((otherFlags & BigNumberFlags.FlagInfinity) != 0) {

                if ((thisFlags & BigNumberFlags.FlagSpecial) == 0 && this.helper.GetMantissa(thisValue).signum() == 0) return this.SignalInvalid(ctx);
                return this.EnsureSign(other, ((thisFlags & BigNumberFlags.FlagNegative) ^ (otherFlags & BigNumberFlags.FlagNegative)) != 0);
            }
        }
        var bigintOp2 = this.helper.GetExponent(other);
        var newexp = (this.helper.GetExponent(thisValue).add(bigintOp2));
        thisFlags = (thisFlags & BigNumberFlags.FlagNegative) ^ (otherFlags & BigNumberFlags.FlagNegative);
        var ret = this.helper.CreateNewWithFlags(this.helper.GetMantissa(thisValue).multiply(this.helper.GetMantissa(other)), newexp, thisFlags);
        if (ctx != null) {
            ret = this.RoundToPrecision(ret, ctx);
        }
        return ret;
    };

    prototype.MultiplyAndAdd = function(thisValue, multiplicand, augend, ctx) {
        var ctx2 = PrecisionContext.Unlimited.WithBlankFlags();
        var ret = this.MultiplyAddHandleSpecial(thisValue, multiplicand, augend, ctx);
        if (ret != null) return ret;
        ret = this.Add(this.Multiply(thisValue, multiplicand, ctx2), augend, ctx);
        if (ctx != null && ctx.getHasFlags()) ctx.setFlags(ctx.getFlags() | (ctx2.getFlags()));
        return ret;
    };

    prototype.RoundToBinaryPrecision = function(thisValue, context) {
        return this.RoundToBinaryPrecisionWithShift(thisValue, context, 0, 0, null, false);
    };
    prototype.RoundToBinaryPrecisionWithShift = function(thisValue, context, lastDiscarded, olderDiscarded, shift, adjustNegativeZero) {
        if ((context) == null) return thisValue;
        if ((context.getPrecision()).signum() == 0 && !context.getHasExponentRange() && (lastDiscarded | olderDiscarded) == 0 && (shift == null || shift.isValueZero())) return thisValue;
        if ((context.getPrecision()).signum() == 0 || this.thisRadix == 2) return this.RoundToPrecisionWithShift(thisValue, context, lastDiscarded, olderDiscarded, shift, false);

        throw new Error();
    };

    prototype.Plus = function(thisValue, context) {
        return this.RoundToPrecisionInternal(thisValue, 0, 0, null, false, true, context);
    };

    prototype.RoundToPrecision = function(thisValue, context) {
        return this.RoundToPrecisionInternal(thisValue, 0, 0, null, false, false, context);
    };
    prototype.RoundToPrecisionWithShift = function(thisValue, context, lastDiscarded, olderDiscarded, shift, adjustNegativeZero) {
        return this.RoundToPrecisionInternal(thisValue, lastDiscarded, olderDiscarded, shift, false, adjustNegativeZero, context);
    };

    prototype.Quantize = function(thisValue, otherValue, ctx) {
        var thisFlags = this.helper.GetFlags(thisValue);
        var otherFlags = this.helper.GetFlags(otherValue);
        if (((thisFlags | otherFlags) & BigNumberFlags.FlagSpecial) != 0) {
            var result = this.HandleNotANumber(thisValue, otherValue, ctx);
            if (result != null) return result;
            if (((thisFlags & otherFlags) & BigNumberFlags.FlagInfinity) != 0) {
                return this.RoundToPrecision(thisValue, ctx);
            }
            if (((thisFlags | otherFlags) & BigNumberFlags.FlagInfinity) != 0) {
                return this.SignalInvalid(ctx);
            }
        }
        var expOther = this.helper.GetExponent(otherValue);
        if (ctx != null && !ctx.ExponentWithinRange(expOther)) return this.SignalInvalidWithMessage(ctx, "Exponent not within exponent range: " + expOther.toString());
        var tmpctx = (ctx == null ? PrecisionContext.ForRounding(Rounding.HalfEven) : ctx.Copy()).WithBlankFlags();
        var mantThis = (this.helper.GetMantissa(thisValue)).abs();
        var expThis = this.helper.GetExponent(thisValue);
        var expcmp = expThis.compareTo(expOther);
        var negativeFlag = (this.helper.GetFlags(thisValue) & BigNumberFlags.FlagNegative);
        var ret = null;
        if (expcmp == 0) {
            ret = this.RoundToPrecision(thisValue, tmpctx);
        } else if (mantThis.signum() == 0) {
            ret = this.helper.CreateNewWithFlags(BigInteger.ZERO, expOther, negativeFlag);
            ret = this.RoundToPrecision(ret, tmpctx);
        } else if (expcmp > 0) {

            var radixPower = FastInteger.FromBig(expThis).SubtractBig(expOther);
            if ((tmpctx.getPrecision()).signum() > 0 && radixPower.compareTo(FastInteger.FromBig(tmpctx.getPrecision()).AddInt(10)) > 0) {

                return this.SignalInvalidWithMessage(ctx, "Result too high for current precision");
            }
            mantThis = this.helper.MultiplyByRadixPower(mantThis, radixPower);
            ret = this.helper.CreateNewWithFlags(mantThis, expOther, negativeFlag);
            ret = this.RoundToPrecision(ret, tmpctx);
        } else {

            var shift = FastInteger.FromBig(expOther).SubtractBig(expThis);
            ret = this.RoundToPrecisionWithShift(thisValue, tmpctx, 0, 0, shift, false);
        }
        if ((tmpctx.getFlags() & PrecisionContext.FlagOverflow) != 0) {
            return this.SignalInvalid(ctx);
        }
        if (ret == null || !this.helper.GetExponent(ret).equals(expOther)) {
            return this.SignalInvalid(ctx);
        }
        ret = this.EnsureSign(ret, negativeFlag != 0);
        if (ctx != null && ctx.getHasFlags()) {
            var flags = tmpctx.getFlags();
            flags &= ~PrecisionContext.FlagUnderflow;
            ctx.setFlags(ctx.getFlags() | (flags));
        }
        return ret;
    };

    prototype.RoundToExponentExact = function(thisValue, expOther, ctx) {
        if (this.helper.GetExponent(thisValue).compareTo(expOther) >= 0) {
            return this.RoundToPrecision(thisValue, ctx);
        } else {
            var pctx = (ctx == null) ? null : ctx.WithPrecision(0).WithBlankFlags();
            var ret = this.Quantize(thisValue, this.helper.CreateNewWithFlags(BigInteger.ONE, expOther, 0), pctx);
            if (ctx != null && ctx.getHasFlags()) {
                ctx.setFlags(ctx.getFlags() | (pctx.getFlags()));
            }
            return ret;
        }
    };

    prototype.RoundToExponentSimple = function(thisValue, expOther, ctx) {
        var thisFlags = this.helper.GetFlags(thisValue);
        if ((thisFlags & BigNumberFlags.FlagSpecial) != 0) {
            var result = this.HandleNotANumber(thisValue, thisValue, ctx);
            if (result != null) return result;
            if ((thisFlags & BigNumberFlags.FlagInfinity) != 0) {
                return thisValue;
            }
        }
        if (this.helper.GetExponent(thisValue).compareTo(expOther) >= 0) {
            return this.RoundToPrecision(thisValue, ctx);
        } else {
            if (ctx != null && !ctx.ExponentWithinRange(expOther)) return this.SignalInvalidWithMessage(ctx, "Exponent not within exponent range: " + expOther.toString());
            var bigmantissa = (this.helper.GetMantissa(thisValue)).abs();
            var shift = FastInteger.FromBig(expOther).SubtractBig(this.helper.GetExponent(thisValue));
            var accum = this.helper.CreateShiftAccumulator(bigmantissa);
            accum.ShiftRight(shift);
            bigmantissa = accum.getShiftedInt();
            return this.RoundToPrecisionWithShift(this.helper.CreateNewWithFlags(bigmantissa, expOther, thisFlags), ctx, accum.getLastDiscardedDigit(), accum.getOlderDiscardedDigits(), new FastInteger(0), false);
        }
    };

    prototype.RoundToExponentNoRoundedFlag = function(thisValue, exponent, ctx) {
        var pctx = (ctx == null) ? null : ctx.WithBlankFlags();
        var ret = this.RoundToExponentExact(thisValue, exponent, pctx);
        if (ctx != null && ctx.getHasFlags()) {
            ctx.setFlags(ctx.getFlags() | (pctx.getFlags() & ~(PrecisionContext.FlagInexact | PrecisionContext.FlagRounded)));
        }
        return ret;
    };

    prototype.ReduceToPrecisionAndIdealExponent = function(thisValue, ctx, precision, idealExp) {
        var ret = this.RoundToPrecision(thisValue, ctx);
        if (ret != null && (this.helper.GetFlags(ret) & BigNumberFlags.FlagSpecial) == 0) {
            var bigmant = (this.helper.GetMantissa(ret)).abs();
            var exp = FastInteger.FromBig(this.helper.GetExponent(ret));
            if (bigmant.signum() == 0) {
                exp = new FastInteger(0);
            } else {
                var radix = this.thisRadix;
                var digits = (precision == null) ? null : this.helper.CreateShiftAccumulator(bigmant).GetDigitLength();
                var bigradix = BigInteger.valueOf(radix);
                while (!(bigmant.signum() == 0)) {
                    if (precision != null && digits.compareTo(precision) == 0) {
                        break;
                    }
                    if (idealExp != null && exp.compareTo(idealExp) == 0) {
                        break;
                    }
                    var bigrem;
                    var bigquo;
                    {
                        var divrem = (bigmant).divideAndRemainder(bigradix);
                        bigquo = divrem[0];
                        bigrem = divrem[1];
                    }
                    if (bigrem.signum() != 0) break;
                    bigmant = bigquo;
                    exp.Increment();
                    if (digits != null) digits.Decrement();
                }
            }
            var flags = this.helper.GetFlags(thisValue);
            ret = this.helper.CreateNewWithFlags(bigmant, exp.AsBigInteger(), flags);
            if (ctx != null && ctx.getClampNormalExponents()) {
                var ctxtmp = ctx.WithBlankFlags();
                ret = this.RoundToPrecision(ret, ctxtmp);
                if (ctx.getHasFlags()) {
                    ctx.setFlags(ctx.getFlags() | (ctxtmp.getFlags() & ~PrecisionContext.FlagClamped));
                }
            }
            ret = this.EnsureSign(ret, (flags & BigNumberFlags.FlagNegative) != 0);
        }
        return ret;
    };

    prototype.Reduce = function(thisValue, ctx) {
        return this.ReduceToPrecisionAndIdealExponent(thisValue, ctx, null, null);
    };
    prototype.RoundToPrecisionInternal = function(thisValue, lastDiscarded, olderDiscarded, shift, binaryPrec, adjustNegativeZero, ctx) {

        if ((ctx) == null) return thisValue;

        if ((ctx.getPrecision()).signum() == 0 && !ctx.getHasExponentRange() && (lastDiscarded | olderDiscarded) == 0 && (shift == null || shift.isValueZero())) return thisValue;

        var fastPrecision = ((ctx.getPrecision()).canFitInInt()) ? new FastInteger((ctx.getPrecision()).intValue()) : FastInteger.FromBig(ctx.getPrecision());
        if (fastPrecision.signum() < 0) throw new Error("precision" + " not greater or equal to " + "0" + " (" + fastPrecision + ")");
        if (this.thisRadix == 2 || fastPrecision.isValueZero()) {

            binaryPrec = false;
        }
        var accum = null;
        var fastEMin = null;
        var fastEMax = null;

        if (ctx.getHasExponentRange()) {
            fastEMax = ((ctx.getEMax()).canFitInInt()) ? new FastInteger((ctx.getEMax()).intValue()) : FastInteger.FromBig(ctx.getEMax());
            fastEMin = ((ctx.getEMin()).canFitInInt()) ? new FastInteger((ctx.getEMin()).intValue()) : FastInteger.FromBig(ctx.getEMin());
        }
        var rounding = ctx.getRounding();
        var thisFlags = this.helper.GetFlags(thisValue);
        var unlimitedPrec = (fastPrecision.isValueZero());
        if (!binaryPrec) {

            if (fastPrecision.signum() > 0 && (shift == null || shift.isValueZero()) && (thisFlags & BigNumberFlags.FlagSpecial) == 0) {
                var mantabs = (this.helper.GetMantissa(thisValue)).abs();
                if (adjustNegativeZero && (thisFlags & BigNumberFlags.FlagNegative) != 0 && mantabs.signum() == 0 && (ctx.getRounding() != Rounding.Floor)) {

                    thisValue = this.EnsureSign(thisValue, false);
                    thisFlags = 0;
                }
                accum = this.helper.CreateShiftAccumulatorWithDigits(mantabs, lastDiscarded, olderDiscarded);
                var digitCount = accum.GetDigitLength();
                if (digitCount.compareTo(fastPrecision) <= 0) {
                    if (!this.RoundGivenDigits(lastDiscarded, olderDiscarded, ctx.getRounding(), (thisFlags & BigNumberFlags.FlagNegative) != 0, mantabs)) {
                        if (ctx.getHasFlags() && (lastDiscarded | olderDiscarded) != 0) {
                            ctx.setFlags(ctx.getFlags() | (PrecisionContext.FlagInexact | PrecisionContext.FlagRounded));
                        }
                        if (!ctx.getHasExponentRange()) return thisValue;
                        var bigexp = this.helper.GetExponent(thisValue);
                        var fastExp = (bigexp.canFitInInt()) ? new FastInteger(bigexp.intValue()) : FastInteger.FromBig(bigexp);
                        var fastAdjustedExp = FastInteger.Copy(fastExp).Add(fastPrecision).Decrement();
                        var fastNormalMin = FastInteger.Copy(fastEMin).Add(fastPrecision).Decrement();
                        if (fastAdjustedExp.compareTo(fastEMax) <= 0 && fastAdjustedExp.compareTo(fastNormalMin) >= 0) {
                            return thisValue;
                        }
                    } else {
                        if (ctx.getHasFlags() && (lastDiscarded | olderDiscarded) != 0) {
                            ctx.setFlags(ctx.getFlags() | (PrecisionContext.FlagInexact | PrecisionContext.FlagRounded));
                        }
                        var stillWithinPrecision = false;
                        mantabs = mantabs.add(BigInteger.ONE);
                        if (digitCount.compareTo(fastPrecision) < 0) {
                            stillWithinPrecision = true;
                        } else {
                            var radixPower = this.helper.MultiplyByRadixPower(BigInteger.ONE, fastPrecision);
                            stillWithinPrecision = (mantabs.compareTo(radixPower) < 0);
                        }
                        if (stillWithinPrecision) {
                            if (!ctx.getHasExponentRange()) return this.helper.CreateNewWithFlags(mantabs, this.helper.GetExponent(thisValue), thisFlags);
                            var bigexp = this.helper.GetExponent(thisValue);
                            var fastExp = (bigexp.canFitInInt()) ? new FastInteger(bigexp.intValue()) : FastInteger.FromBig(bigexp);
                            var fastAdjustedExp = FastInteger.Copy(fastExp).Add(fastPrecision).Decrement();
                            var fastNormalMin = FastInteger.Copy(fastEMin).Add(fastPrecision).Decrement();
                            if (fastAdjustedExp.compareTo(fastEMax) <= 0 && fastAdjustedExp.compareTo(fastNormalMin) >= 0) {
                                return this.helper.CreateNewWithFlags(mantabs, bigexp, thisFlags);
                            }
                        }
                    }
                }
            }
        }
        if ((thisFlags & BigNumberFlags.FlagSpecial) != 0) {
            if ((thisFlags & BigNumberFlags.FlagSignalingNaN) != 0) {
                if (ctx.getHasFlags()) {
                    ctx.setFlags(ctx.getFlags() | (PrecisionContext.FlagInvalid));
                }
                return this.ReturnQuietNaN(thisValue, ctx);
            }
            if ((thisFlags & BigNumberFlags.FlagQuietNaN) != 0) {
                return this.ReturnQuietNaN(thisValue, ctx);
            }
            if ((thisFlags & BigNumberFlags.FlagInfinity) != 0) {
                return thisValue;
            }
        }
        if (adjustNegativeZero && (thisFlags & BigNumberFlags.FlagNegative) != 0 && this.helper.GetMantissa(thisValue).signum() == 0 && (rounding != Rounding.Floor)) {

            thisValue = this.EnsureSign(thisValue, false);
            thisFlags = 0;
        }
        var neg = (thisFlags & BigNumberFlags.FlagNegative) != 0;
        var bigmantissa = (this.helper.GetMantissa(thisValue)).abs();

        var oldmantissa = bigmantissa;
        var mantissaWasZero = (oldmantissa.signum() == 0 && (lastDiscarded | olderDiscarded) == 0);
        var maxMantissa = BigInteger.ONE;
        var exp = FastInteger.FromBig(this.helper.GetExponent(thisValue));
        var flags = 0;
        if (accum == null) accum = this.helper.CreateShiftAccumulatorWithDigits(bigmantissa, lastDiscarded, olderDiscarded);
        if (binaryPrec) {
            var prec = FastInteger.Copy(fastPrecision);
            while (prec.signum() > 0) {
                var bitShift = (prec.CompareToInt(1000000) >= 0) ? 1000000 : prec.AsInt32();
                maxMantissa = maxMantissa.shiftLeft(bitShift);
                prec.SubtractInt(bitShift);
            }
            maxMantissa = maxMantissa.subtract(BigInteger.ONE);
            var accumMaxMant = this.helper.CreateShiftAccumulator(maxMantissa);

            fastPrecision = accumMaxMant.GetDigitLength();
        }
        if (shift != null && shift.signum() != 0) {
            accum.ShiftRight(shift);
        }
        if (!unlimitedPrec) {
            accum.ShiftToDigits(fastPrecision);
        } else {
            fastPrecision = accum.GetDigitLength();
        }
        if (binaryPrec) {
            while ((accum.getShiftedInt()).compareTo(maxMantissa) > 0) {
                accum.ShiftRightInt(1);
            }
        }
        var discardedBits = FastInteger.Copy(accum.getDiscardedDigitCount());
        exp.Add(discardedBits);
        var adjExponent = FastInteger.Copy(exp).Add(accum.GetDigitLength()).Decrement();

        var newAdjExponent = adjExponent;
        var clamp = null;
        var earlyRounded = BigInteger.ZERO;
        if (binaryPrec && fastEMax != null && adjExponent.compareTo(fastEMax) == 0) {

            var expdiff = FastInteger.Copy(fastPrecision).Subtract(accum.GetDigitLength());
            var currMantissa = accum.getShiftedInt();
            currMantissa = this.helper.MultiplyByRadixPower(currMantissa, expdiff);
            if ((currMantissa).compareTo(maxMantissa) > 0) {

                adjExponent.Increment();
            }
        }

        if (ctx.getHasFlags() && fastEMin != null && !unlimitedPrec && adjExponent.compareTo(fastEMin) < 0) {
            earlyRounded = accum.getShiftedInt();
            if (this.RoundGivenBigInt(accum, rounding, neg, earlyRounded)) {
                earlyRounded = earlyRounded.add(BigInteger.ONE);
                if (earlyRounded.testBit(0) == false || (this.thisRadix & 1) != 0) {
                    var accum2 = this.helper.CreateShiftAccumulator(earlyRounded);
                    var newDigitLength = accum2.GetDigitLength();

                    if (binaryPrec || newDigitLength.compareTo(fastPrecision) > 0) {
                        newDigitLength = FastInteger.Copy(fastPrecision);
                    }
                    newAdjExponent = FastInteger.Copy(exp).Add(newDigitLength).Decrement();
                }
            }
        }
        if (fastEMax != null && adjExponent.compareTo(fastEMax) > 0) {
            if (mantissaWasZero) {
                if (ctx.getHasFlags()) {
                    ctx.setFlags(ctx.getFlags() | (flags | PrecisionContext.FlagClamped));
                }
                if (!binaryPrec && ctx.getClampNormalExponents()) {

                    var clampExp = FastInteger.Copy(fastEMax).Increment().Subtract(fastPrecision);
                    if (fastEMax.compareTo(clampExp) > 0) {
                        if (ctx.getHasFlags()) ctx.setFlags(ctx.getFlags() | (PrecisionContext.FlagClamped));
                        fastEMax = clampExp;
                    }
                }
                return this.helper.CreateNewWithFlags(oldmantissa, fastEMax.AsBigInteger(), thisFlags);
            } else {

                flags |= PrecisionContext.FlagOverflow | PrecisionContext.FlagInexact | PrecisionContext.FlagRounded;
                if (rounding == Rounding.Unnecessary) throw new Error("Rounding was required");
                if (!unlimitedPrec && (rounding == Rounding.Down || rounding == Rounding.ZeroFiveUp || (rounding == Rounding.Ceiling && neg) || (rounding == Rounding.Floor && !neg))) {

                    var overflowMant = BigInteger.ZERO;
                    if (binaryPrec) {
                        overflowMant = maxMantissa;
                    } else {
                        overflowMant = this.helper.MultiplyByRadixPower(BigInteger.ONE, fastPrecision);
                        overflowMant = overflowMant.subtract(BigInteger.ONE);
                    }
                    if (ctx.getHasFlags()) ctx.setFlags(ctx.getFlags() | (flags));
                    clamp = FastInteger.Copy(fastEMax).Increment().Subtract(fastPrecision);
                    return this.helper.CreateNewWithFlags(overflowMant, clamp.AsBigInteger(), neg ? BigNumberFlags.FlagNegative : 0);
                }
                if (ctx.getHasFlags()) ctx.setFlags(ctx.getFlags() | (flags));
                return this.SignalOverflow(neg);
            }
        } else if (fastEMin != null && adjExponent.compareTo(fastEMin) < 0) {

            var fastETiny = FastInteger.Copy(fastEMin).Subtract(fastPrecision).Increment();
            if (ctx.getHasFlags()) {
                if (earlyRounded.signum() != 0) {
                    if (newAdjExponent.compareTo(fastEMin) < 0) {
                        flags |= PrecisionContext.FlagSubnormal;
                    }
                }
            }

            var subExp = FastInteger.Copy(exp);

            if (subExp.compareTo(fastETiny) < 0) {

                var expdiff = FastInteger.Copy(fastETiny).Subtract(exp);
                expdiff.Add(discardedBits);
                accum = this.helper.CreateShiftAccumulatorWithDigits(oldmantissa, lastDiscarded, olderDiscarded);
                accum.ShiftRight(expdiff);
                var newmantissa = accum.getShiftedIntFast();
                if ((accum.getLastDiscardedDigit() | accum.getOlderDiscardedDigits()) != 0) {
                    if (rounding == Rounding.Unnecessary) throw new Error("Rounding was required");
                }
                if ((accum.getDiscardedDigitCount()).signum() != 0 || (accum.getLastDiscardedDigit() | accum.getOlderDiscardedDigits()) != 0) {
                    if (ctx.getHasFlags()) {
                        if (!mantissaWasZero) flags |= PrecisionContext.FlagRounded;
                        if ((accum.getLastDiscardedDigit() | accum.getOlderDiscardedDigits()) != 0) {
                            flags |= PrecisionContext.FlagInexact | PrecisionContext.FlagRounded;
                        }
                    }
                    if (this.Round(accum, rounding, neg, newmantissa)) {
                        newmantissa.Increment();
                    }
                }
                if (ctx.getHasFlags()) {
                    if (newmantissa.isValueZero()) flags |= PrecisionContext.FlagClamped;
                    if ((flags & (PrecisionContext.FlagSubnormal | PrecisionContext.FlagInexact)) == (PrecisionContext.FlagSubnormal | PrecisionContext.FlagInexact)) flags |= PrecisionContext.FlagUnderflow | PrecisionContext.FlagRounded;
                    ctx.setFlags(ctx.getFlags() | (flags));
                }
                bigmantissa = newmantissa.AsBigInteger();
                if (!binaryPrec && ctx.getClampNormalExponents()) {

                    var clampExp = FastInteger.Copy(fastEMax).Increment().Subtract(fastPrecision);
                    if (fastETiny.compareTo(clampExp) > 0) {
                        if (!(bigmantissa.signum() == 0)) {
                            expdiff = FastInteger.Copy(fastETiny).Subtract(clampExp);
                            bigmantissa = this.helper.MultiplyByRadixPower(bigmantissa, expdiff);
                        }
                        if (ctx.getHasFlags()) ctx.setFlags(ctx.getFlags() | (PrecisionContext.FlagClamped));
                        fastETiny = clampExp;
                    }
                }
                return this.helper.CreateNewWithFlags(newmantissa.AsBigInteger(), fastETiny.AsBigInteger(), neg ? BigNumberFlags.FlagNegative : 0);
            }
        }
        var recheckOverflow = false;
        if ((accum.getDiscardedDigitCount()).signum() != 0 || (accum.getLastDiscardedDigit() | accum.getOlderDiscardedDigits()) != 0) {
            if (bigmantissa.signum() != 0) flags |= PrecisionContext.FlagRounded;
            bigmantissa = accum.getShiftedInt();
            if ((accum.getLastDiscardedDigit() | accum.getOlderDiscardedDigits()) != 0) {
                flags |= PrecisionContext.FlagInexact | PrecisionContext.FlagRounded;
                if (rounding == Rounding.Unnecessary) throw new Error("Rounding was required");
            }
            if (this.RoundGivenBigInt(accum, rounding, neg, bigmantissa)) {
                var oldDigitLength = accum.GetDigitLength();
                bigmantissa = bigmantissa.add(BigInteger.ONE);
                if (binaryPrec) recheckOverflow = true;

                if (!unlimitedPrec && (bigmantissa.testBit(0) == false || (this.thisRadix & 1) != 0) && (binaryPrec || oldDigitLength.compareTo(fastPrecision) >= 0)) {
                    accum = this.helper.CreateShiftAccumulator(bigmantissa);
                    var newDigitLength = accum.GetDigitLength();
                    if (binaryPrec || newDigitLength.compareTo(fastPrecision) > 0) {
                        var neededShift = FastInteger.Copy(newDigitLength).Subtract(fastPrecision);
                        accum.ShiftRight(neededShift);
                        if (binaryPrec) {
                            while ((accum.getShiftedInt()).compareTo(maxMantissa) > 0) {
                                accum.ShiftRightInt(1);
                            }
                        }
                        if ((accum.getDiscardedDigitCount()).signum() != 0) {
                            exp.Add(accum.getDiscardedDigitCount());
                            discardedBits.Add(accum.getDiscardedDigitCount());
                            bigmantissa = accum.getShiftedInt();
                            if (!binaryPrec) recheckOverflow = true;
                        }
                    }
                }
            }
        }
        if (recheckOverflow && fastEMax != null) {

            adjExponent = FastInteger.Copy(exp);
            adjExponent.Add(accum.GetDigitLength()).Decrement();
            if (binaryPrec && fastEMax != null && adjExponent.compareTo(fastEMax) == 0) {

                var expdiff = FastInteger.Copy(fastPrecision).Subtract(accum.GetDigitLength());
                var currMantissa = accum.getShiftedInt();
                currMantissa = this.helper.MultiplyByRadixPower(currMantissa, expdiff);
                if ((currMantissa).compareTo(maxMantissa) > 0) {

                    adjExponent.Increment();
                }
            }
            if (adjExponent.compareTo(fastEMax) > 0) {
                flags |= PrecisionContext.FlagOverflow | PrecisionContext.FlagInexact | PrecisionContext.FlagRounded;
                if (!unlimitedPrec && (rounding == Rounding.Down || rounding == Rounding.ZeroFiveUp || (rounding == Rounding.Ceiling && neg) || (rounding == Rounding.Floor && !neg))) {

                    var overflowMant = BigInteger.ZERO;
                    if (binaryPrec) {
                        overflowMant = maxMantissa;
                    } else {
                        overflowMant = this.helper.MultiplyByRadixPower(BigInteger.ONE, fastPrecision);
                        overflowMant = overflowMant.subtract(BigInteger.ONE);
                    }
                    if (ctx.getHasFlags()) ctx.setFlags(ctx.getFlags() | (flags));
                    clamp = FastInteger.Copy(fastEMax).Increment().Subtract(fastPrecision);
                    return this.helper.CreateNewWithFlags(overflowMant, clamp.AsBigInteger(), neg ? BigNumberFlags.FlagNegative : 0);
                }
                if (ctx.getHasFlags()) ctx.setFlags(ctx.getFlags() | (flags));
                return this.SignalOverflow(neg);
            }
        }
        if (ctx.getHasFlags()) ctx.setFlags(ctx.getFlags() | (flags));
        if (!binaryPrec && ctx.getClampNormalExponents()) {

            var clampExp = FastInteger.Copy(fastEMax).Increment().Subtract(fastPrecision);
            if (exp.compareTo(clampExp) > 0) {
                if (!(bigmantissa.signum() == 0)) {
                    var expdiff = FastInteger.Copy(exp).Subtract(clampExp);
                    bigmantissa = this.helper.MultiplyByRadixPower(bigmantissa, expdiff);
                }
                if (ctx.getHasFlags()) ctx.setFlags(ctx.getFlags() | (PrecisionContext.FlagClamped));
                exp = clampExp;
            }
        }
        return this.helper.CreateNewWithFlags(bigmantissa, exp.AsBigInteger(), neg ? BigNumberFlags.FlagNegative : 0);
    };
    prototype.AddCore = function(mant1, mant2, exponent, flags1, flags2, ctx) {

        var neg1 = (flags1 & BigNumberFlags.FlagNegative) != 0;
        var neg2 = (flags2 & BigNumberFlags.FlagNegative) != 0;
        var negResult = false;
        if (neg1 != neg2) {

            mant1 = mant1.subtract(mant2);
            var mant1Sign = mant1.signum();
            negResult = neg1 ^ (mant1Sign == 0 ? neg2 : (mant1Sign < 0));
        } else {

            mant1 = mant1.add(mant2);
            negResult = neg1;
        }
        if (mant1.signum() == 0 && negResult) {

            if (!((neg1 && neg2) || ((neg1 ^ neg2) && ctx != null && ctx.getRounding() == Rounding.Floor))) {
                negResult = false;
            }
        }
        return this.helper.CreateNewWithFlags(mant1, exponent, negResult ? BigNumberFlags.FlagNegative : 0);
    };

    prototype.Add = function(thisValue, other, ctx) {
        var thisFlags = this.helper.GetFlags(thisValue);
        var otherFlags = this.helper.GetFlags(other);
        if (((thisFlags | otherFlags) & BigNumberFlags.FlagSpecial) != 0) {
            var result = this.HandleNotANumber(thisValue, other, ctx);
            if (result != null) return result;
            if ((thisFlags & BigNumberFlags.FlagInfinity) != 0) {
                if ((otherFlags & BigNumberFlags.FlagInfinity) != 0) {
                    if ((thisFlags & BigNumberFlags.FlagNegative) != (otherFlags & BigNumberFlags.FlagNegative)) return this.SignalInvalid(ctx);
                }
                return thisValue;
            }
            if ((otherFlags & BigNumberFlags.FlagInfinity) != 0) {
                return other;
            }
        }
        var expcmp = this.helper.GetExponent(thisValue).compareTo(this.helper.GetExponent(other));
        var retval = null;
        var op1MantAbs = (this.helper.GetMantissa(thisValue)).abs();
        var op2MantAbs = (this.helper.GetMantissa(other)).abs();
        if (expcmp == 0) {
            retval = this.AddCore(op1MantAbs, op2MantAbs, this.helper.GetExponent(thisValue), thisFlags, otherFlags, ctx);
        } else {

            var op1 = thisValue;
            var op2 = other;
            var op1Exponent = this.helper.GetExponent(op1);
            var op2Exponent = this.helper.GetExponent(op2);
            var resultExponent = (expcmp < 0 ? op1Exponent : op2Exponent);
            var fastOp1Exp = FastInteger.FromBig(op1Exponent);
            var fastOp2Exp = FastInteger.FromBig(op2Exponent);
            var expdiff = FastInteger.Copy(fastOp1Exp).Subtract(fastOp2Exp).Abs();
            if (ctx != null && (ctx.getPrecision()).signum() > 0) {

                var fastPrecision = FastInteger.FromBig(ctx.getPrecision());

                if (FastInteger.Copy(expdiff).compareTo(fastPrecision) > 0) {
                    var expcmp2 = fastOp1Exp.compareTo(fastOp2Exp);
                    if (expcmp2 < 0) {
                        if (!(op2MantAbs.signum() == 0)) {

                            var digitLength1 = this.helper.CreateShiftAccumulator(op1MantAbs).GetDigitLength();
                            if (FastInteger.Copy(fastOp1Exp).Add(digitLength1).AddInt(2).compareTo(fastOp2Exp) < 0) {

                                var tmp = FastInteger.Copy(fastOp2Exp).SubtractInt(4).Subtract(digitLength1).SubtractBig(ctx.getPrecision());
                                var newDiff = FastInteger.Copy(tmp).Subtract(fastOp2Exp).Abs();
                                if (newDiff.compareTo(expdiff) < 0) {

                                    var sameSign = (this.helper.GetSign(thisValue) == this.helper.GetSign(other));
                                    var oneOpIsZero = (op1MantAbs.signum() == 0);
                                    var digitLength2 = this.helper.CreateShiftAccumulator(op2MantAbs).GetDigitLength();
                                    if (digitLength2.compareTo(fastPrecision) < 0) {

                                        var precisionDiff = FastInteger.Copy(fastPrecision).Subtract(digitLength2);
                                        if (!oneOpIsZero && !sameSign) {
                                            precisionDiff.AddInt(2);
                                        }
                                        op2MantAbs = this.helper.MultiplyByRadixPower(op2MantAbs, precisionDiff);
                                        var bigintTemp = precisionDiff.AsBigInteger();
                                        op2Exponent = op2Exponent.subtract(bigintTemp);
                                        if (!oneOpIsZero && !sameSign) {
                                            op2MantAbs = op2MantAbs.subtract(BigInteger.ONE);
                                        }
                                        other = this.helper.CreateNewWithFlags(op2MantAbs, op2Exponent, this.helper.GetFlags(other));
                                        var shift = FastInteger.Copy(digitLength2).Subtract(fastPrecision);
                                        if (oneOpIsZero && ctx != null && ctx.getHasFlags()) {
                                            ctx.setFlags(ctx.getFlags() | (PrecisionContext.FlagRounded));
                                        }
                                        return this.RoundToPrecisionWithShift(other, ctx, (oneOpIsZero || sameSign) ? 0 : 1, (oneOpIsZero && !sameSign) ? 0 : 1, shift, false);
                                    } else {
                                        if (!oneOpIsZero && !sameSign) {
                                            op2MantAbs = this.helper.MultiplyByRadixPower(op2MantAbs, new FastInteger(2));
                                            op2Exponent = op2Exponent.subtract(BigInteger.valueOf(2));
                                            op2MantAbs = op2MantAbs.subtract(BigInteger.ONE);
                                            other = this.helper.CreateNewWithFlags(op2MantAbs, op2Exponent, this.helper.GetFlags(other));
                                            var shift = FastInteger.Copy(digitLength2).Subtract(fastPrecision);
                                            return this.RoundToPrecisionWithShift(other, ctx, 0, 0, shift, false);
                                        } else {
                                            var shift2 = FastInteger.Copy(digitLength2).Subtract(fastPrecision);
                                            if (!sameSign && ctx != null && ctx.getHasFlags()) {
                                                ctx.setFlags(ctx.getFlags() | (PrecisionContext.FlagRounded));
                                            }
                                            return this.RoundToPrecisionWithShift(other, ctx, 0, sameSign ? 1 : 0, shift2, false);
                                        }
                                    }
                                }
                            }
                        }
                    } else if (expcmp2 > 0) {
                        if (!(op1MantAbs.signum() == 0)) {

                            var digitLength2 = this.helper.CreateShiftAccumulator(op2MantAbs).GetDigitLength();
                            if (FastInteger.Copy(fastOp2Exp).Add(digitLength2).AddInt(2).compareTo(fastOp1Exp) < 0) {

                                var tmp = FastInteger.Copy(fastOp1Exp).SubtractInt(4).Subtract(digitLength2).SubtractBig(ctx.getPrecision());
                                var newDiff = FastInteger.Copy(tmp).Subtract(fastOp1Exp).Abs();
                                if (newDiff.compareTo(expdiff) < 0) {

                                    var sameSign = (this.helper.GetSign(thisValue) == this.helper.GetSign(other));
                                    var oneOpIsZero = (op2MantAbs.signum() == 0);
                                    digitLength2 = this.helper.CreateShiftAccumulator(op1MantAbs).GetDigitLength();
                                    if (digitLength2.compareTo(fastPrecision) < 0) {

                                        var precisionDiff = FastInteger.Copy(fastPrecision).Subtract(digitLength2);
                                        if (!oneOpIsZero && !sameSign) {
                                            precisionDiff.AddInt(2);
                                        }
                                        op1MantAbs = this.helper.MultiplyByRadixPower(op1MantAbs, precisionDiff);
                                        var bigintTemp = precisionDiff.AsBigInteger();
                                        op1Exponent = op1Exponent.subtract(bigintTemp);
                                        if (!oneOpIsZero && !sameSign) {
                                            op1MantAbs = op1MantAbs.subtract(BigInteger.ONE);
                                        }
                                        thisValue = this.helper.CreateNewWithFlags(op1MantAbs, op1Exponent, this.helper.GetFlags(thisValue));
                                        var shift = FastInteger.Copy(digitLength2).Subtract(fastPrecision);
                                        if (oneOpIsZero && ctx != null && ctx.getHasFlags()) {
                                            ctx.setFlags(ctx.getFlags() | (PrecisionContext.FlagRounded));
                                        }
                                        return this.RoundToPrecisionWithShift(thisValue, ctx, (oneOpIsZero || sameSign) ? 0 : 1, (oneOpIsZero && !sameSign) ? 0 : 1, shift, false);
                                    } else {
                                        if (!oneOpIsZero && !sameSign) {
                                            op1MantAbs = this.helper.MultiplyByRadixPower(op1MantAbs, new FastInteger(2));
                                            op1Exponent = op1Exponent.subtract(BigInteger.valueOf(2));
                                            op1MantAbs = op1MantAbs.subtract(BigInteger.ONE);
                                            thisValue = this.helper.CreateNewWithFlags(op1MantAbs, op1Exponent, this.helper.GetFlags(thisValue));
                                            var shift = FastInteger.Copy(digitLength2).Subtract(fastPrecision);
                                            return this.RoundToPrecisionWithShift(thisValue, ctx, 0, 0, shift, false);
                                        } else {
                                            var shift2 = FastInteger.Copy(digitLength2).Subtract(fastPrecision);
                                            if (!sameSign && ctx != null && ctx.getHasFlags()) {
                                                ctx.setFlags(ctx.getFlags() | (PrecisionContext.FlagRounded));
                                            }
                                            return this.RoundToPrecisionWithShift(thisValue, ctx, 0, sameSign ? 1 : 0, shift2, false);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    expcmp = op1Exponent.compareTo(op2Exponent);
                    resultExponent = (expcmp < 0 ? op1Exponent : op2Exponent);
                }
            }
            if (expcmp > 0) {
                op1MantAbs = this.helper.RescaleByExponentDiff(op1MantAbs, op1Exponent, op2Exponent);

                retval = this.AddCore(op1MantAbs, op2MantAbs, resultExponent, thisFlags, otherFlags, ctx);
            } else {
                op2MantAbs = this.helper.RescaleByExponentDiff(op2MantAbs, op1Exponent, op2Exponent);

                retval = this.AddCore(op1MantAbs, op2MantAbs, resultExponent, thisFlags, otherFlags, ctx);
            }
        }
        if (ctx != null) {
            retval = this.RoundToPrecision(retval, ctx);
        }
        return retval;
    };

    prototype.CompareToWithContext = function(thisValue, decfrac, treatQuietNansAsSignaling, ctx) {
        if (decfrac == null) return this.SignalInvalid(ctx);
        var result = this.CompareToHandleSpecial(thisValue, decfrac, treatQuietNansAsSignaling, ctx);
        if (result != null) return result;
        return this.ValueOf(this.compareTo(thisValue, decfrac), null);
    };

    prototype.compareTo = function(thisValue, decfrac) {
        if (decfrac == null) return 1;
        var flagsThis = this.helper.GetFlags(thisValue);
        var flagsOther = this.helper.GetFlags(decfrac);
        if ((flagsThis & BigNumberFlags.FlagNaN) != 0) {
            if ((flagsOther & BigNumberFlags.FlagNaN) != 0) {
                return 0;
            }
            return 1;
        }

        if ((flagsOther & BigNumberFlags.FlagNaN) != 0) {
            return -1;
        }

        var s = this.CompareToHandleSpecialReturnInt(thisValue, decfrac);
        if (s <= 1) return s;
        s = this.helper.GetSign(thisValue);
        var ds = this.helper.GetSign(decfrac);
        if (s != ds) return (s < ds) ? -1 : 1;
        if (ds == 0 || s == 0) {

            return 0;
        }
        var expcmp = this.helper.GetExponent(thisValue).compareTo(this.helper.GetExponent(decfrac));

        var mantcmp = (this.helper.GetMantissa(thisValue)).abs().compareTo((this.helper.GetMantissa(decfrac)).abs());
        if (s < 0) mantcmp = -mantcmp;
        if (mantcmp == 0) {

            return s < 0 ? -expcmp : expcmp;
        }
        if (expcmp == 0) {
            return mantcmp;
        }
        var op1Exponent = this.helper.GetExponent(thisValue);
        var op2Exponent = this.helper.GetExponent(decfrac);
        var fastOp1Exp = FastInteger.FromBig(op1Exponent);
        var fastOp2Exp = FastInteger.FromBig(op2Exponent);
        var expdiff = FastInteger.Copy(fastOp1Exp).Subtract(fastOp2Exp).Abs();

        if (expdiff.CompareToInt(100) >= 0) {
            var op1MantAbs = (this.helper.GetMantissa(thisValue)).abs();
            var op2MantAbs = (this.helper.GetMantissa(decfrac)).abs();
            var precision1 = this.helper.CreateShiftAccumulator(op1MantAbs).GetDigitLength();
            var precision2 = this.helper.CreateShiftAccumulator(op2MantAbs).GetDigitLength();
            var maxPrecision = null;
            if (precision1.compareTo(precision2) > 0) maxPrecision = precision1; else maxPrecision = precision2;

            if (FastInteger.Copy(expdiff).compareTo(maxPrecision) > 0) {
                var expcmp2 = fastOp1Exp.compareTo(fastOp2Exp);
                if (expcmp2 < 0) {
                    if (!(op2MantAbs.signum() == 0)) {

                        var digitLength1 = this.helper.CreateShiftAccumulator(op1MantAbs).GetDigitLength();
                        if (FastInteger.Copy(fastOp1Exp).Add(digitLength1).AddInt(2).compareTo(fastOp2Exp) < 0) {

                            var tmp = FastInteger.Copy(fastOp2Exp).SubtractInt(8).Subtract(digitLength1).Subtract(maxPrecision);
                            var newDiff = FastInteger.Copy(tmp).Subtract(fastOp2Exp).Abs();
                            if (newDiff.compareTo(expdiff) < 0) {
                                if (s == ds) {
                                    return (s < 0) ? 1 : -1;
                                } else {
                                    op1Exponent = (tmp.AsBigInteger());
                                }
                            }
                        }
                    }
                } else if (expcmp2 > 0) {
                    if (!(op1MantAbs.signum() == 0)) {

                        var digitLength2 = this.helper.CreateShiftAccumulator(op2MantAbs).GetDigitLength();
                        if (FastInteger.Copy(fastOp2Exp).Add(digitLength2).AddInt(2).compareTo(fastOp1Exp) < 0) {

                            var tmp = FastInteger.Copy(fastOp1Exp).SubtractInt(8).Subtract(digitLength2).Subtract(maxPrecision);
                            var newDiff = FastInteger.Copy(tmp).Subtract(fastOp1Exp).Abs();
                            if (newDiff.compareTo(expdiff) < 0) {
                                if (s == ds) {
                                    return (s < 0) ? -1 : 1;
                                } else {
                                    op2Exponent = (tmp.AsBigInteger());
                                }
                            }
                        }
                    }
                }
                expcmp = op1Exponent.compareTo(op2Exponent);
            }
        }
        if (expcmp > 0) {
            var newmant = this.helper.RescaleByExponentDiff(this.helper.GetMantissa(thisValue), op1Exponent, op2Exponent);
            var othermant = (this.helper.GetMantissa(decfrac)).abs();
            newmant = (newmant).abs();
            mantcmp = newmant.compareTo(othermant);
            return (s < 0) ? -mantcmp : mantcmp;
        } else {
            var newmant = this.helper.RescaleByExponentDiff(this.helper.GetMantissa(decfrac), op1Exponent, op2Exponent);
            var othermant = (this.helper.GetMantissa(thisValue)).abs();
            newmant = (newmant).abs();
            mantcmp = othermant.compareTo(newmant);
            return (s < 0) ? -mantcmp : mantcmp;
        }
    };
})(RadixMath,RadixMath.prototype);

var ExtendedDecimal =

function(mantissa, exponent) {

    this.exponent = exponent;
    var sign = mantissa.signum();
    this.unsignedMantissa = sign < 0 ? ((mantissa).negate()) : mantissa;
    this.flags = (sign < 0) ? BigNumberFlags.FlagNegative : 0;
};
(function(constructor,prototype){
    prototype['exponent'] = prototype.exponent = null;
    prototype['unsignedMantissa'] = prototype.unsignedMantissa = null;
    prototype['flags'] = prototype.flags = null;
    prototype['getExponent'] = prototype.getExponent = function() {
        return this.exponent;
    };
    prototype['getUnsignedMantissa'] = prototype.getUnsignedMantissa = function() {
        return this.unsignedMantissa;
    };
    prototype['getMantissa'] = prototype.getMantissa = function() {
        return this.isNegative() ? ((this.unsignedMantissa).negate()) : this.unsignedMantissa;
    };
    prototype['EqualsInternal'] = prototype.EqualsInternal = function(otherValue) {
        if (otherValue == null) return false;
        return this.flags == otherValue.flags && this.unsignedMantissa.equals(otherValue.unsignedMantissa) && this.exponent.equals(otherValue.exponent);
    };
    prototype['equals'] = prototype.equals = function(obj) {
        return this.EqualsInternal((obj.constructor==ExtendedDecimal) ? obj : null);
    };
    prototype['hashCode'] = prototype.hashCode = function() {
        var hashCode_ = 0;
        {
            hashCode_ = hashCode_ + 1000000007 * this.exponent.hashCode();
            hashCode_ = hashCode_ + 1000000009 * this.unsignedMantissa.hashCode();
            hashCode_ = hashCode_ + 1000000009 * this.flags;
        }
        return hashCode_;
    };
    constructor['CreateWithFlags'] = constructor.CreateWithFlags = function(mantissa, exponent, flags) {
        var ext = new ExtendedDecimal(mantissa, exponent);
        ext.flags = flags;
        return ext;
    };
    constructor['MaxSafeInt'] = constructor.MaxSafeInt = 214748363;

    constructor['FromString'] = constructor.FromString = function(str, ctx) {
        if (str == null) throw new Error("str");
        if (str.length == 0) throw new Error();
        var offset = 0;
        var negative = false;
        if (str.charAt(0) == '+' || str.charAt(0) == '-') {
            negative = (str.charAt(0) == '-');
            offset++;
        }
        var mantInt = 0;
        var mant = null;
        var haveDecimalPoint = false;
        var haveDigits = false;
        var haveExponent = false;
        var newScaleInt = 0;
        var newScale = null;
        var i = offset;
        if (i + 8 == str.length) {
            if ((str.charAt(i) == 'I' || str.charAt(i) == 'i') && (str.charAt(i + 1) == 'N' || str.charAt(i + 1) == 'n') && (str.charAt(i + 2) == 'F' || str.charAt(i + 2) == 'f') && (str.charAt(i + 3) == 'I' || str.charAt(i + 3) == 'i') && (str.charAt(i + 4) == 'N' || str.charAt(i + 4) == 'n') && (str.charAt(i + 5) == 'I' || str.charAt(i + 5) == 'i') && (str.charAt(i + 6) == 'T' || str.charAt(i + 6) == 't') && (str.charAt(i + 7) == 'Y' || str.charAt(i + 7) == 'y')) return (negative) ? ExtendedDecimal.NegativeInfinity : ExtendedDecimal.PositiveInfinity;
        }
        if (i + 3 == str.length) {
            if ((str.charAt(i) == 'I' || str.charAt(i) == 'i') && (str.charAt(i + 1) == 'N' || str.charAt(i + 1) == 'n') && (str.charAt(i + 2) == 'F' || str.charAt(i + 2) == 'f')) return (negative) ? ExtendedDecimal.NegativeInfinity : ExtendedDecimal.PositiveInfinity;
        }
        if (i + 3 <= str.length) {

            if ((str.charAt(i) == 'N' || str.charAt(i) == 'n') && (str.charAt(i + 1) == 'A' || str.charAt(i + 1) == 'a') && (str.charAt(i + 2) == 'N' || str.charAt(i + 2) == 'n')) {
                if (i + 3 == str.length) {
                    if (!negative) return ExtendedDecimal.NaN;
                    return ExtendedDecimal.CreateWithFlags(BigInteger.ZERO, BigInteger.ZERO, (negative ? BigNumberFlags.FlagNegative : 0) | BigNumberFlags.FlagQuietNaN);
                }
                i = i + (3);
                var digitCount = new FastInteger(0);
                var maxDigits = null;
                haveDigits = false;
                if (ctx != null && !((ctx.getPrecision()).signum() == 0)) {
                    maxDigits = FastInteger.FromBig(ctx.getPrecision());
                    if (ctx.getClampNormalExponents()) maxDigits.Decrement();
                }
                for (; i < str.length; i++) {
                    if (str.charAt(i) >= '0' && str.charAt(i) <= '9') {
                        var thisdigit = ((str.charCodeAt(i)-48)|0);
                        haveDigits = (haveDigits || thisdigit != 0);
                        if (mantInt > ExtendedDecimal.MaxSafeInt) {
                            if (mant == null) mant = new FastInteger(mantInt);
                            if (thisdigit == 0) mant.Multiply(10); else mant.MultiplyByTenAndAdd(thisdigit);
                        } else {
                            mantInt *= 10;
                            mantInt = mantInt + (thisdigit);
                        }
                        if (haveDigits && maxDigits != null) {
                            digitCount.Increment();
                            if (digitCount.compareTo(maxDigits) > 0) {

                                throw new Error();
                            }
                        }
                    } else {
                        throw new Error();
                    }
                }
                var bigmant = (mant == null) ? (BigInteger.valueOf(mantInt)) : mant.AsBigInteger();
                return ExtendedDecimal.CreateWithFlags(bigmant, BigInteger.ZERO, (negative ? BigNumberFlags.FlagNegative : 0) | BigNumberFlags.FlagQuietNaN);
            }
        }
        if (i + 4 <= str.length) {

            if ((str.charAt(i) == 'S' || str.charAt(i) == 's') && (str.charAt(i + 1) == 'N' || str.charAt(i + 1) == 'n') && (str.charAt(i + 2) == 'A' || str.charAt(i + 2) == 'a') && (str.charAt(i + 3) == 'N' || str.charAt(i + 3) == 'n')) {
                if (i + 4 == str.length) {
                    if (!negative) return ExtendedDecimal.SignalingNaN;
                    return ExtendedDecimal.CreateWithFlags(BigInteger.ZERO, BigInteger.ZERO, (negative ? BigNumberFlags.FlagNegative : 0) | BigNumberFlags.FlagSignalingNaN);
                }
                i = i + (4);
                var digitCount = new FastInteger(0);
                var maxDigits = null;
                haveDigits = false;
                if (ctx != null && !((ctx.getPrecision()).signum() == 0)) {
                    maxDigits = FastInteger.FromBig(ctx.getPrecision());
                    if (ctx.getClampNormalExponents()) maxDigits.Decrement();
                }
                for (; i < str.length; i++) {
                    if (str.charAt(i) >= '0' && str.charAt(i) <= '9') {
                        var thisdigit = ((str.charCodeAt(i)-48)|0);
                        haveDigits = (haveDigits || thisdigit != 0);
                        if (mantInt > ExtendedDecimal.MaxSafeInt) {
                            if (mant == null) mant = new FastInteger(mantInt);
                            mant.MultiplyByTenAndAdd(thisdigit);
                        } else {
                            mantInt *= 10;
                            mantInt = mantInt + (thisdigit);
                        }
                        if (haveDigits && maxDigits != null) {
                            digitCount.Increment();
                            if (digitCount.compareTo(maxDigits) > 0) {

                                throw new Error();
                            }
                        }
                    } else {
                        throw new Error();
                    }
                }
                var bigmant = (mant == null) ? (BigInteger.valueOf(mantInt)) : mant.AsBigInteger();
                return ExtendedDecimal.CreateWithFlags(bigmant, BigInteger.ZERO, (negative ? BigNumberFlags.FlagNegative : 0) | BigNumberFlags.FlagSignalingNaN);
            }
        }
        for (; i < str.length; i++) {
            if (str.charAt(i) >= '0' && str.charAt(i) <= '9') {
                var thisdigit = ((str.charCodeAt(i)-48)|0);
                if (mantInt > ExtendedDecimal.MaxSafeInt) {
                    if (mant == null) mant = new FastInteger(mantInt);
                    mant.MultiplyByTenAndAdd(thisdigit);
                } else {
                    mantInt *= 10;
                    mantInt = mantInt + (thisdigit);
                }
                haveDigits = true;
                if (haveDecimalPoint) {
                    if (newScaleInt == -2147483648) {
                        if (newScale == null) newScale = new FastInteger(newScaleInt);
                        newScale.AddInt(-1);
                    } else {
                        newScaleInt--;
                    }
                }
            } else if (str.charAt(i) == '.') {
                if (haveDecimalPoint) throw new Error();
                haveDecimalPoint = true;
            } else if (str.charAt(i) == 'E' || str.charAt(i) == 'e') {
                haveExponent = true;
                i++;
                break;
            } else {
                throw new Error();
            }
        }
        if (!haveDigits) throw new Error();
        if (haveExponent) {
            var exp = null;
            var expInt = 0;
            offset = 1;
            haveDigits = false;
            if (i == str.length) throw new Error();
            if (str.charAt(i) == '+' || str.charAt(i) == '-') {
                if (str.charAt(i) == '-') offset = -1;
                i++;
            }
            for (; i < str.length; i++) {
                if (str.charAt(i) >= '0' && str.charAt(i) <= '9') {
                    haveDigits = true;
                    var thisdigit = ((str.charCodeAt(i)-48)|0);
                    if (expInt > ExtendedDecimal.MaxSafeInt) {
                        if (exp == null) exp = new FastInteger(expInt);
                        exp.MultiplyByTenAndAdd(thisdigit);
                    } else {
                        expInt *= 10;
                        expInt = expInt + (thisdigit);
                    }
                } else {
                    throw new Error();
                }
            }
            if (!haveDigits) throw new Error();
            if (offset >= 0 && newScaleInt == 0 && newScale == null && exp == null) {
                newScaleInt = expInt;
            } else if (exp == null) {
                if (newScale == null) newScale = new FastInteger(newScaleInt);
                if (offset < 0) newScale.SubtractInt(expInt); else newScale.AddInt(expInt);
            } else {
                if (newScale == null) newScale = new FastInteger(newScaleInt);
                if (offset < 0) newScale.Subtract(exp); else newScale.Add(exp);
            }
        }
        if (i != str.length) {
            throw new Error();
        }
        var ret = ExtendedDecimal.CreateWithFlags((mant == null) ? (BigInteger.valueOf(mantInt)) : mant.AsBigInteger(), (newScale == null) ? (BigInteger.valueOf(newScaleInt)) : newScale.AsBigInteger(), negative ? BigNumberFlags.FlagNegative : 0);
        if (ctx != null) ret = ret.RoundToPrecision(ctx);
        return ret;
    };
    constructor['DecimalMathHelper'] = constructor.DecimalMathHelper = function ExtendedDecimal$DecimalMathHelper(){};
    (function(constructor,prototype){

        prototype['GetRadix'] = prototype.GetRadix = function() {
            return 10;
        };

        prototype['GetSign'] = prototype.GetSign = function(value) {
            return value.signum();
        };

        prototype['GetMantissa'] = prototype.GetMantissa = function(value) {
            return value.unsignedMantissa;
        };

        prototype['GetExponent'] = prototype.GetExponent = function(value) {
            return value.exponent;
        };

        prototype['RescaleByExponentDiff'] = prototype.RescaleByExponentDiff = function(mantissa, e1, e2) {
            if (mantissa.signum() == 0) return BigInteger.ZERO;
            var diff = FastInteger.FromBig(e1).SubtractBig(e2).Abs();
            if (diff.CanFitInInt32()) {
                mantissa = mantissa.multiply(DecimalUtility.FindPowerOfTen(diff.AsInt32()));
            } else {
                mantissa = mantissa.multiply(DecimalUtility.FindPowerOfTenFromBig(diff.AsBigInteger()));
            }
            return mantissa;
        };

        prototype['CreateShiftAccumulatorWithDigits'] = prototype.CreateShiftAccumulatorWithDigits = function(bigint, lastDigit, olderDigits) {
            return new DigitShiftAccumulator(bigint, lastDigit, olderDigits);
        };

        prototype['CreateShiftAccumulator'] = prototype.CreateShiftAccumulator = function(bigint) {
            return new DigitShiftAccumulator(bigint, 0, 0);
        };

        prototype['HasTerminatingRadixExpansion'] = prototype.HasTerminatingRadixExpansion = function(numerator, denominator) {

            var gcd = numerator.gcd(denominator);
            denominator = denominator.divide(gcd);
            if (denominator.signum() == 0) return false;

            while (denominator.testBit(0) == false) {
                denominator = denominator.shiftRight(1);
            }

            while (true) {
                var bigrem;
                var bigquo;
                {
                    var divrem = (denominator).divideAndRemainder(BigInteger.valueOf(5));
                    bigquo = divrem[0];
                    bigrem = divrem[1];
                }
                if (bigrem.signum() != 0) break;
                denominator = bigquo;
            }
            return denominator.compareTo(BigInteger.ONE) == 0;
        };

        prototype['MultiplyByRadixPower'] = prototype.MultiplyByRadixPower = function(bigint, power) {
            if (power.signum() <= 0) return bigint;
            if (bigint.signum() == 0) return bigint;
            if (bigint.compareTo(BigInteger.ONE) != 0) {
                if (power.CanFitInInt32()) {
                    bigint = bigint.multiply(DecimalUtility.FindPowerOfTen(power.AsInt32()));
                } else {
                    bigint = bigint.multiply(DecimalUtility.FindPowerOfTenFromBig(power.AsBigInteger()));
                }
                return bigint;
            } else {
                if (power.CanFitInInt32()) {
                    return (DecimalUtility.FindPowerOfTen(power.AsInt32()));
                } else {
                    return (DecimalUtility.FindPowerOfTenFromBig(power.AsBigInteger()));
                }
            }
        };

        prototype['GetFlags'] = prototype.GetFlags = function(value) {
            return value.flags;
        };

        prototype['CreateNewWithFlags'] = prototype.CreateNewWithFlags = function(mantissa, exponent, flags) {
            return ExtendedDecimal.CreateWithFlags(mantissa, exponent, flags);
        };

        prototype['GetArithmeticSupport'] = prototype.GetArithmeticSupport = function() {
            return BigNumberFlags.FiniteAndNonFinite;
        };

        prototype['ValueOf'] = prototype.ValueOf = function(val) {
            if (val == 0) return ExtendedDecimal.Zero;
            if (val == 1) return ExtendedDecimal.One;
            return ExtendedDecimal.FromInt64(val);
        };
    })(ExtendedDecimal.DecimalMathHelper,ExtendedDecimal.DecimalMathHelper.prototype);

    constructor['AppendString'] = constructor.AppendString = function(builder, c, count) {
        if (count.CompareToInt(2147483647) > 0 || count.signum() < 0) {
            throw new Error();
        }
        var icount = count.AsInt32();
        for (var i = icount - 1; i >= 0; i--) {
            builder.append(c);
        }
        return true;
    };
    prototype['ToStringInternal'] = prototype.ToStringInternal = function(mode) {

        var negative = (this.flags & BigNumberFlags.FlagNegative) != 0;
        if ((this.flags & BigNumberFlags.FlagInfinity) != 0) {
            return negative ? "-Infinity" : "Infinity";
        }
        if ((this.flags & BigNumberFlags.FlagSignalingNaN) != 0) {
            if (this.unsignedMantissa.signum() == 0) return negative ? "-sNaN" : "sNaN";
            return negative ? "-sNaN" + (this.unsignedMantissa).abs().toString() : "sNaN" + (this.unsignedMantissa).abs().toString();
        }
        if ((this.flags & BigNumberFlags.FlagQuietNaN) != 0) {
            if (this.unsignedMantissa.signum() == 0) return negative ? "-NaN" : "NaN";
            return negative ? "-NaN" + (this.unsignedMantissa).abs().toString() : "NaN" + (this.unsignedMantissa).abs().toString();
        }
        var mantissaString = (this.unsignedMantissa).abs().toString();
        var scaleSign = -this.exponent.signum();
        if (scaleSign == 0) return negative ? "-" + mantissaString : mantissaString;
        var iszero = (this.unsignedMantissa.signum() == 0);
        if (mode == 2 && iszero && scaleSign < 0) {

            return negative ? "-" + mantissaString : mantissaString;
        }
        var sbLength = new FastInteger(mantissaString.length);
        var adjustedExponent = FastInteger.FromBig(this.exponent);
        var thisExponent = FastInteger.Copy(adjustedExponent);
        adjustedExponent.Add(sbLength).AddInt(-1);
        var decimalPointAdjust = new FastInteger(1);
        var threshold = new FastInteger(-6);
        if (mode == 1) {

            var newExponent = FastInteger.Copy(adjustedExponent);
            var adjExponentNegative = (adjustedExponent.signum() < 0);
            var intphase = FastInteger.Copy(adjustedExponent).Abs().Mod(3).AsInt32();
            if (iszero && (adjustedExponent.compareTo(threshold) < 0 || scaleSign < 0)) {
                if (intphase == 1) {
                    if (adjExponentNegative) {
                        decimalPointAdjust.Increment();
                        newExponent.Increment();
                    } else {
                        decimalPointAdjust.AddInt(2);
                        newExponent.AddInt(2);
                    }
                } else if (intphase == 2) {
                    if (!adjExponentNegative) {
                        decimalPointAdjust.Increment();
                        newExponent.Increment();
                    } else {
                        decimalPointAdjust.AddInt(2);
                        newExponent.AddInt(2);
                    }
                }
                threshold.Increment();
            } else {
                if (intphase == 1) {
                    if (!adjExponentNegative) {
                        decimalPointAdjust.Increment();
                        newExponent.AddInt(-1);
                    } else {
                        decimalPointAdjust.AddInt(2);
                        newExponent.AddInt(-2);
                    }
                } else if (intphase == 2) {
                    if (adjExponentNegative) {
                        decimalPointAdjust.Increment();
                        newExponent.AddInt(-1);
                    } else {
                        decimalPointAdjust.AddInt(2);
                        newExponent.AddInt(-2);
                    }
                }
            }
            adjustedExponent = newExponent;
        }
        if (mode == 2 || (adjustedExponent.compareTo(threshold) >= 0 && scaleSign >= 0)) {
            if (scaleSign > 0) {
                var decimalPoint = FastInteger.Copy(thisExponent).Add(sbLength);
                var cmp = decimalPoint.CompareToInt(0);
                var builder = null;
                if (cmp < 0) {
                    var tmpFast = new FastInteger(mantissaString.length).AddInt(6);
                    builder = JSInteropFactory.createStringBuilder(tmpFast.CompareToInt(2147483647) > 0 ? 2147483647 : tmpFast.AsInt32());
                    if (negative) builder.append('-');
                    builder.append("0.");
                    ExtendedDecimal.AppendString(builder, '0', FastInteger.Copy(decimalPoint).Negate());
                    builder.append(mantissaString);
                } else if (cmp == 0) {
                    if (!decimalPoint.CanFitInInt32()) throw new Error();
                    var tmpInt = decimalPoint.AsInt32();
                    if (tmpInt < 0) tmpInt = 0;
                    var tmpFast = new FastInteger(mantissaString.length).AddInt(6);
                    builder = JSInteropFactory.createStringBuilder(tmpFast.CompareToInt(2147483647) > 0 ? 2147483647 : tmpFast.AsInt32());
                    if (negative) builder.append('-');
                    for (var arrfillI = 0; arrfillI < (0) + (tmpInt); arrfillI++) builder.append(mantissaString.charAt(arrfillI));
                    builder.append("0.");
                    for (var arrfillI = tmpInt; arrfillI < (tmpInt) + (mantissaString.length - tmpInt); arrfillI++) builder.append(mantissaString.charAt(arrfillI));
                } else if (decimalPoint.CompareToInt(mantissaString.length) > 0) {
                    var insertionPoint = sbLength;
                    if (!insertionPoint.CanFitInInt32()) throw new Error();
                    var tmpInt = insertionPoint.AsInt32();
                    if (tmpInt < 0) tmpInt = 0;
                    var tmpFast = new FastInteger(mantissaString.length).AddInt(6);
                    builder = JSInteropFactory.createStringBuilder(tmpFast.CompareToInt(2147483647) > 0 ? 2147483647 : tmpFast.AsInt32());
                    if (negative) builder.append('-');
                    for (var arrfillI = 0; arrfillI < (0) + (tmpInt); arrfillI++) builder.append(mantissaString.charAt(arrfillI));
                    ExtendedDecimal.AppendString(builder, '0', FastInteger.Copy(decimalPoint).SubtractInt(builder.length));
                    builder.append('.');
                    for (var arrfillI = tmpInt; arrfillI < (tmpInt) + (mantissaString.length - tmpInt); arrfillI++) builder.append(mantissaString.charAt(arrfillI));
                } else {
                    if (!decimalPoint.CanFitInInt32()) throw new Error();
                    var tmpInt = decimalPoint.AsInt32();
                    if (tmpInt < 0) tmpInt = 0;
                    var tmpFast = new FastInteger(mantissaString.length).AddInt(6);
                    builder = JSInteropFactory.createStringBuilder(tmpFast.CompareToInt(2147483647) > 0 ? 2147483647 : tmpFast.AsInt32());
                    if (negative) builder.append('-');
                    for (var arrfillI = 0; arrfillI < (0) + (tmpInt); arrfillI++) builder.append(mantissaString.charAt(arrfillI));
                    builder.append('.');
                    for (var arrfillI = tmpInt; arrfillI < (tmpInt) + (mantissaString.length - tmpInt); arrfillI++) builder.append(mantissaString.charAt(arrfillI));
                }
                return builder.toString();
            } else if (mode == 2 && scaleSign < 0) {
                var negscale = FastInteger.Copy(thisExponent);
                var builder = JSInteropFactory.createStringBuilder(16);
                if (negative) builder.append('-');
                builder.append(mantissaString);
                ExtendedDecimal.AppendString(builder, '0', negscale);
                return builder.toString();
            } else if (!negative) {
                return mantissaString;
            } else {
                return "-" + mantissaString;
            }
        } else {
            var builder = null;
            if (mode == 1 && iszero && decimalPointAdjust.CompareToInt(1) > 0) {
                builder = JSInteropFactory.createStringBuilder(16);
                if (negative) builder.append('-');
                builder.append(mantissaString);
                builder.append('.');
                ExtendedDecimal.AppendString(builder, '0', FastInteger.Copy(decimalPointAdjust).AddInt(-1));
            } else {
                var tmp = FastInteger.Copy(decimalPointAdjust);
                var cmp = tmp.CompareToInt(mantissaString.length);
                if (cmp > 0) {
                    tmp.SubtractInt(mantissaString.length);
                    builder = JSInteropFactory.createStringBuilder(16);
                    if (negative) builder.append('-');
                    builder.append(mantissaString);
                    ExtendedDecimal.AppendString(builder, '0', tmp);
                } else if (cmp < 0) {

                    if (!tmp.CanFitInInt32()) throw new Error();
                    var tmpInt = tmp.AsInt32();
                    if (tmp.signum() < 0) tmpInt = 0;
                    var tmpFast = new FastInteger(mantissaString.length).AddInt(6);
                    builder = JSInteropFactory.createStringBuilder(tmpFast.CompareToInt(2147483647) > 0 ? 2147483647 : tmpFast.AsInt32());
                    if (negative) builder.append('-');
                    for (var arrfillI = 0; arrfillI < (0) + (tmpInt); arrfillI++) builder.append(mantissaString.charAt(arrfillI));
                    builder.append('.');
                    for (var arrfillI = tmpInt; arrfillI < (tmpInt) + (mantissaString.length - tmpInt); arrfillI++) builder.append(mantissaString.charAt(arrfillI));
                } else if (adjustedExponent.signum() == 0 && !negative) {
                    return mantissaString;
                } else if (adjustedExponent.signum() == 0 && negative) {
                    return "-" + mantissaString;
                } else {
                    builder = JSInteropFactory.createStringBuilder(16);
                    if (negative) builder.append('-');
                    builder.append(mantissaString);
                }
            }
            if (adjustedExponent.signum() != 0) {
                builder.append(adjustedExponent.signum() < 0 ? "E-" : "E+");
                adjustedExponent.Abs();
                var builderReversed = JSInteropFactory.createStringBuilder(16);
                while (adjustedExponent.signum() != 0) {
                    var digit = FastInteger.Copy(adjustedExponent).Mod(10).AsInt32();

                    builderReversed.append(48 + digit);
                    adjustedExponent.Divide(10);
                }
                var count = builderReversed.length();
                for (var i = 0; i < count; i++) {
                    builder.append(builderReversed.charAt(count - 1 - i));
                }
            }
            return builder.toString();
        }
    };

    prototype['ToBigInteger'] = prototype.ToBigInteger = function() {
        var sign = this.getExponent().signum();
        if (sign == 0) {
            var bigmantissa = this.getMantissa();
            return bigmantissa;
        } else if (sign > 0) {
            var bigmantissa = this.getMantissa();
            bigmantissa = bigmantissa.multiply(DecimalUtility.FindPowerOfTenFromBig(this.getExponent()));
            return bigmantissa;
        } else {
            var bigmantissa = this.getMantissa();
            var bigexponent = this.getExponent();
            bigexponent = bigexponent.negate();
            bigmantissa = bigmantissa.divide(DecimalUtility.FindPowerOfTenFromBig(bigexponent));
            return bigmantissa;
        }
    };
    constructor['OneShift62'] = constructor.OneShift62 = BigInteger.ONE.shiftLeft(62);

    prototype['ToExtendedFloat'] = prototype.ToExtendedFloat = function() {
        if (this.IsNaN() || this.IsInfinity()) {
            return ExtendedFloat.CreateWithFlags(this.unsignedMantissa, this.exponent, this.flags);
        }
        var bigintExp = this.getExponent();
        var bigintMant = this.getMantissa();
        if (bigintMant.signum() == 0) {
            return this.isNegative() ? ExtendedFloat.NegativeZero : ExtendedFloat.Zero;
        }
        if (bigintExp.signum() == 0) {

            return ExtendedFloat.FromBigInteger(bigintMant);
        } else if (bigintExp.signum() > 0) {

            var bigmantissa = bigintMant;
            bigmantissa = bigmantissa.multiply(DecimalUtility.FindPowerOfTenFromBig(bigintExp));
            return ExtendedFloat.FromBigInteger(bigmantissa);
        } else {

            var scale = FastInteger.FromBig(bigintExp);
            var bigmantissa = bigintMant;
            var neg = (bigmantissa.signum() < 0);
            var remainder;
            if (neg) bigmantissa = (bigmantissa).negate();
            var negscale = FastInteger.Copy(scale).Negate();
            var divisor = DecimalUtility.FindPowerOfFiveFromBig(negscale.AsBigInteger());
            while (true) {
                var quotient;
                {
                    var divrem = (bigmantissa).divideAndRemainder(divisor);
                    quotient = divrem[0];
                    remainder = divrem[1];
                }

                if (remainder.signum() != 0 && quotient.compareTo(ExtendedDecimal.OneShift62) < 0) {

                    var bits = FastInteger.GetLastWords(quotient, 2);
                    var shift = 0;
                    if ((bits[0] | bits[1]) != 0) {

                        var bitPrecision = DecimalUtility.BitPrecisionInt(bits[1]);
                        if (bitPrecision != 0) bitPrecision = bitPrecision + (32); else bitPrecision = DecimalUtility.BitPrecisionInt(bits[0]);
                        shift = 63 - bitPrecision;
                        scale.SubtractInt(shift);
                    } else {

                        shift = 1;
                        scale.SubtractInt(shift);
                    }

                    bigmantissa = bigmantissa.shiftLeft(shift);
                } else {
                    bigmantissa = quotient;
                    break;
                }
            }

            var halfDivisor = divisor;
            halfDivisor = halfDivisor.shiftRight(1);
            var cmp = remainder.compareTo(halfDivisor);

            if (cmp > 0) {

                bigmantissa = bigmantissa.add(BigInteger.ONE);
            }
            if (neg) bigmantissa = (bigmantissa).negate();
            return new ExtendedFloat(bigmantissa, scale.AsBigInteger());
        }
    };

    prototype['ToSingle'] = prototype.ToSingle = function() {
        if (this.IsPositiveInfinity()) return Number.POSITIVE_INFINITY;
        if (this.IsNegativeInfinity()) return Number.NEGATIVE_INFINITY;
        if (this.isNegative() && this.signum() == 0) {
            return Float.intBitsToFloat(1 << 31);
        }
        return this.ToExtendedFloat().ToSingle();
    };

    prototype['ToDouble'] = prototype.ToDouble = function() {
        if (this.IsPositiveInfinity()) return Number.POSITIVE_INFINITY;
        if (this.IsNegativeInfinity()) return Number.NEGATIVE_INFINITY;
        if (this.isNegative() && this.signum() == 0) {
            return Extras.IntegersToDouble([((1 << 31)|0), 0]);
        }
        return this.ToExtendedFloat().ToDouble();
    };

    constructor['FromSingle'] = constructor.FromSingle = function(flt) {
        var value = Float.floatToRawIntBits(flt);
        var neg = ((value >> 31) != 0);
        var fpExponent = ((value >> 23) & 255);
        var fpMantissa = value & 8388607;
        if (fpExponent == 255) {
            if (fpMantissa == 0) {
                return neg ? ExtendedDecimal.NegativeInfinity : ExtendedDecimal.PositiveInfinity;
            }

            var quiet = (fpMantissa & 4194304) != 0;
            fpMantissa &= 2097151;
            var info = BigInteger.valueOf(fpMantissa);
            info = info.subtract(BigInteger.ONE);
            if (info.signum() == 0) {
                return quiet ? ExtendedDecimal.NaN : ExtendedDecimal.SignalingNaN;
            } else {
                return ExtendedDecimal.CreateWithFlags(info, BigInteger.ZERO, (neg ? BigNumberFlags.FlagNegative : 0) | (quiet ? BigNumberFlags.FlagQuietNaN : BigNumberFlags.FlagSignalingNaN));
            }
        }
        if (fpExponent == 0) fpExponent++; else fpMantissa |= (1 << 23);
        if (fpMantissa == 0) {
            return neg ? ExtendedDecimal.NegativeZero : ExtendedDecimal.Zero;
        }
        fpExponent -= 150;
        while ((fpMantissa & 1) == 0) {
            fpExponent++;
            fpMantissa >>= 1;
        }
        if (fpExponent == 0) {
            if (neg) fpMantissa = -fpMantissa;
            return ExtendedDecimal.FromInt64(fpMantissa);
        } else if (fpExponent > 0) {

            var bigmantissa = BigInteger.valueOf(fpMantissa);
            bigmantissa = bigmantissa.shiftLeft(fpExponent);
            if (neg) bigmantissa = (bigmantissa).negate();
            return ExtendedDecimal.FromBigInteger(bigmantissa);
        } else {

            var bigmantissa = BigInteger.valueOf(fpMantissa);
            bigmantissa = bigmantissa.multiply(DecimalUtility.FindPowerOfFive(-fpExponent));
            if (neg) bigmantissa = (bigmantissa).negate();
            return new ExtendedDecimal(bigmantissa, BigInteger.valueOf(fpExponent));
        }
    };
    constructor['FromBigInteger'] = constructor.FromBigInteger = function(bigint) {
        return new ExtendedDecimal(bigint, BigInteger.ZERO);
    };
    constructor['FromInt64'] = constructor.FromInt64 = function(valueSmall_obj) {
        var valueSmall = JSInteropFactory.createLong(valueSmall_obj);
        var bigint = BigInteger.valueOf(valueSmall);
        return new ExtendedDecimal(bigint, BigInteger.ZERO);
    };

    constructor['FromDouble'] = constructor.FromDouble = function(dbl) {
        var value = Extras.DoubleToIntegers(dbl);
        var fpExponent = ((value[1] >> 20) & 2047);
        var neg = (value[1] >> 31) != 0;
        if (fpExponent == 2047) {
            if ((value[1] & 1048575) == 0 && value[0] == 0) {
                return neg ? ExtendedDecimal.NegativeInfinity : ExtendedDecimal.PositiveInfinity;
            }

            var quiet = (value[1] & 524288) != 0;
            value[1] = value[1] & 262143;
            var info = FastInteger.WordsToBigInteger(value);
            info = info.subtract(BigInteger.ONE);
            if (info.signum() == 0) {
                return quiet ? ExtendedDecimal.NaN : ExtendedDecimal.SignalingNaN;
            } else {
                return ExtendedDecimal.CreateWithFlags(info, BigInteger.ZERO, (neg ? BigNumberFlags.FlagNegative : 0) | (quiet ? BigNumberFlags.FlagQuietNaN : BigNumberFlags.FlagSignalingNaN));
            }
        }
        value[1] = value[1] & 1048575;

        if (fpExponent == 0) fpExponent++; else value[1] = value[1] | 1048576;
        if ((value[1] | value[0]) != 0) {
            fpExponent = fpExponent + (DecimalUtility.ShiftAwayTrailingZerosTwoElements(value));
        } else {
            return neg ? ExtendedDecimal.NegativeZero : ExtendedDecimal.Zero;
        }
        fpExponent -= 1075;
        var fpMantissaBig = FastInteger.WordsToBigInteger(value);
        if (fpExponent == 0) {
            if (neg) fpMantissaBig = fpMantissaBig.negate();
            return ExtendedDecimal.FromBigInteger(fpMantissaBig);
        } else if (fpExponent > 0) {

            var bigmantissa = fpMantissaBig;
            bigmantissa = bigmantissa.shiftLeft(fpExponent);
            if (neg) bigmantissa = (bigmantissa).negate();
            return ExtendedDecimal.FromBigInteger(bigmantissa);
        } else {

            var bigmantissa = fpMantissaBig;
            bigmantissa = bigmantissa.multiply(DecimalUtility.FindPowerOfFive(-fpExponent));
            if (neg) bigmantissa = (bigmantissa).negate();
            return new ExtendedDecimal(bigmantissa, BigInteger.valueOf(fpExponent));
        }
    };

    constructor['FromExtendedFloat'] = constructor.FromExtendedFloat = function(bigfloat) {
        if ((bigfloat) == null) throw new Error("bigfloat");
        if (bigfloat.IsNaN() || bigfloat.IsInfinity()) {
            return ExtendedDecimal.CreateWithFlags(bigfloat.getUnsignedMantissa(), bigfloat.getExponent(), (bigfloat.isNegative() ? BigNumberFlags.FlagNegative : 0) | (bigfloat.IsInfinity() ? BigNumberFlags.FlagInfinity : 0) | (bigfloat.IsQuietNaN() ? BigNumberFlags.FlagQuietNaN : 0) | (bigfloat.IsSignalingNaN() ? BigNumberFlags.FlagSignalingNaN : 0));
        }
        var bigintExp = bigfloat.getExponent();
        var bigintMant = bigfloat.getMantissa();
        if (bigintMant.signum() == 0) {
            return bigfloat.isNegative() ? ExtendedDecimal.NegativeZero : ExtendedDecimal.Zero;
        }
        if (bigintExp.signum() == 0) {

            return ExtendedDecimal.FromBigInteger(bigintMant);
        } else if (bigintExp.signum() > 0) {

            var intcurexp = FastInteger.FromBig(bigintExp);
            var bigmantissa = bigintMant;
            var neg = (bigmantissa.signum() < 0);
            if (neg) bigmantissa = (bigmantissa).negate();
            while (intcurexp.signum() > 0) {
                var shift = 512;
                if (intcurexp.CompareToInt(512) < 0) {
                    shift = intcurexp.AsInt32();
                }
                bigmantissa = bigmantissa.shiftLeft(shift);
                intcurexp.AddInt(-shift);
            }
            if (neg) bigmantissa = (bigmantissa).negate();
            return ExtendedDecimal.FromBigInteger(bigmantissa);
        } else {

            var bigmantissa = bigintMant;
            var negbigintExp = (bigintExp).negate();
            bigmantissa = bigmantissa.multiply(DecimalUtility.FindPowerOfFiveFromBig(negbigintExp));
            return new ExtendedDecimal(bigmantissa, bigintExp);
        }
    };

    prototype['toString'] = prototype.toString = function() {
        return this.ToStringInternal(0);
    };

    prototype['ToEngineeringString'] = prototype.ToEngineeringString = function() {
        return this.ToStringInternal(1);
    };

    prototype['ToPlainString'] = prototype.ToPlainString = function() {
        return this.ToStringInternal(2);
    };
    constructor['One'] = constructor.One = new ExtendedDecimal(BigInteger.ONE, BigInteger.ZERO);
    constructor['Zero'] = constructor.Zero = new ExtendedDecimal(BigInteger.ZERO, BigInteger.ZERO);
    constructor['NegativeZero'] = constructor.NegativeZero = ExtendedDecimal.CreateWithFlags(BigInteger.ZERO, BigInteger.ZERO, BigNumberFlags.FlagNegative);
    constructor['Ten'] = constructor.Ten = new ExtendedDecimal(BigInteger.TEN, BigInteger.ZERO);
    constructor['NaN'] = constructor.NaN = ExtendedDecimal.CreateWithFlags(BigInteger.ZERO, BigInteger.ZERO, BigNumberFlags.FlagQuietNaN);
    constructor['SignalingNaN'] = constructor.SignalingNaN = ExtendedDecimal.CreateWithFlags(BigInteger.ZERO, BigInteger.ZERO, BigNumberFlags.FlagSignalingNaN);
    constructor['PositiveInfinity'] = constructor.PositiveInfinity = ExtendedDecimal.CreateWithFlags(BigInteger.ZERO, BigInteger.ZERO, BigNumberFlags.FlagInfinity);
    constructor['NegativeInfinity'] = constructor.NegativeInfinity = ExtendedDecimal.CreateWithFlags(BigInteger.ZERO, BigInteger.ZERO, BigNumberFlags.FlagInfinity | BigNumberFlags.FlagNegative);

    prototype['IsPositiveInfinity'] = prototype.IsPositiveInfinity = function() {
        return (this.flags & (BigNumberFlags.FlagInfinity | BigNumberFlags.FlagNegative)) == (BigNumberFlags.FlagInfinity | BigNumberFlags.FlagNegative);
    };

    prototype['IsNegativeInfinity'] = prototype.IsNegativeInfinity = function() {
        return (this.flags & (BigNumberFlags.FlagInfinity | BigNumberFlags.FlagNegative)) == (BigNumberFlags.FlagInfinity);
    };

    prototype['IsNaN'] = prototype.IsNaN = function() {
        return (this.flags & (BigNumberFlags.FlagQuietNaN | BigNumberFlags.FlagSignalingNaN)) != 0;
    };

    prototype['IsInfinity'] = prototype.IsInfinity = function() {
        return (this.flags & (BigNumberFlags.FlagInfinity)) != 0;
    };

    prototype['isNegative'] = prototype.isNegative = function() {
        return (this.flags & (BigNumberFlags.FlagNegative)) != 0;
    };

    prototype['IsQuietNaN'] = prototype.IsQuietNaN = function() {
        return (this.flags & (BigNumberFlags.FlagQuietNaN)) != 0;
    };

    prototype['IsSignalingNaN'] = prototype.IsSignalingNaN = function() {
        return (this.flags & (BigNumberFlags.FlagSignalingNaN)) != 0;
    };

    prototype['signum'] = prototype.signum = function() {
        return (((this.flags & BigNumberFlags.FlagSpecial) == 0) && this.unsignedMantissa.signum() == 0) ? 0 : (((this.flags & BigNumberFlags.FlagNegative) != 0) ? -1 : 1);
    };

    prototype['isZero'] = prototype.isZero = function() {
        return ((this.flags & BigNumberFlags.FlagSpecial) == 0) && this.unsignedMantissa.signum() == 0;
    };

    prototype['DivideToSameExponent'] = prototype.DivideToSameExponent = function(divisor, rounding) {
        return this.DivideToExponent(divisor, this.exponent, PrecisionContext.ForRounding(rounding));
    };

    prototype['Reduce'] = prototype.Reduce = function(ctx) {
        return ExtendedDecimal.math.Reduce(this, ctx);
    };

    prototype['RemainderNaturalScale'] = prototype.RemainderNaturalScale = function(divisor, ctx) {
        return this.Subtract(this.DivideToIntegerNaturalScale(divisor, null).Multiply(divisor, null), ctx);
    };

    prototype['Divide'] = prototype.Divide = function(divisor, ctx) {
        return ExtendedDecimal.math.Divide(this, divisor, ctx);
    };

    prototype['DivideToExponent'] = prototype.DivideToExponent = function(divisor, exponent, ctx) {
        return ExtendedDecimal.math.DivideToExponent(this, divisor, exponent, ctx);
    };

    prototype['Abs'] = prototype.Abs = function(context) {
        return ExtendedDecimal.math.Abs(this, context);
    };

    prototype['Negate'] = prototype.Negate = function(context) {
        return ExtendedDecimal.math.Negate(this, context);
    };

    prototype['Subtract'] = prototype.Subtract = function(decfrac, ctx) {
        if ((decfrac) == null) throw new Error("decfrac");
        var negated = decfrac;
        if ((decfrac.flags & BigNumberFlags.FlagNaN) == 0) {
            var newflags = decfrac.flags ^ BigNumberFlags.FlagNegative;
            negated = ExtendedDecimal.CreateWithFlags(decfrac.unsignedMantissa, decfrac.exponent, newflags);
        }
        return this.Add(negated, ctx);
    };
    constructor['math'] = constructor.math = new RadixMath(new ExtendedDecimal.DecimalMathHelper());

    prototype['DivideToIntegerNaturalScale'] = prototype.DivideToIntegerNaturalScale = function(divisor, ctx) {
        return ExtendedDecimal.math.DivideToIntegerNaturalScale(this, divisor, ctx);
    };

    prototype['DivideToIntegerZeroScale'] = prototype.DivideToIntegerZeroScale = function(divisor, ctx) {
        return ExtendedDecimal.math.DivideToIntegerZeroScale(this, divisor, ctx);
    };

    prototype['Remainder'] = prototype.Remainder = function(divisor, ctx) {
        return ExtendedDecimal.math.Remainder(this, divisor, ctx);
    };

    prototype['RemainderNear'] = prototype.RemainderNear = function(divisor, ctx) {
        return ExtendedDecimal.math.RemainderNear(this, divisor, ctx);
    };

    prototype['NextMinus'] = prototype.NextMinus = function(ctx) {
        return ExtendedDecimal.math.NextMinus(this, ctx);
    };

    prototype['NextPlus'] = prototype.NextPlus = function(ctx) {
        return ExtendedDecimal.math.NextPlus(this, ctx);
    };

    prototype['NextToward'] = prototype.NextToward = function(otherValue, ctx) {
        return ExtendedDecimal.math.NextToward(this, otherValue, ctx);
    };

    constructor['Max'] = constructor.Max = function(first, second, ctx) {
        return ExtendedDecimal.math.Max(first, second, ctx);
    };

    constructor['Min'] = constructor.Min = function(first, second, ctx) {
        return ExtendedDecimal.math.Min(first, second, ctx);
    };

    constructor['MaxMagnitude'] = constructor.MaxMagnitude = function(first, second, ctx) {
        return ExtendedDecimal.math.MaxMagnitude(first, second, ctx);
    };

    constructor['MinMagnitude'] = constructor.MinMagnitude = function(first, second, ctx) {
        return ExtendedDecimal.math.MinMagnitude(first, second, ctx);
    };

    prototype['compareTo'] = prototype.compareTo = function(other) {
        return ExtendedDecimal.math.compareTo(this, other);
    };

    prototype['CompareToWithContext'] = prototype.CompareToWithContext = function(other, ctx) {
        return ExtendedDecimal.math.CompareToWithContext(this, other, false, ctx);
    };

    prototype['CompareToSignal'] = prototype.CompareToSignal = function(other, ctx) {
        return ExtendedDecimal.math.CompareToWithContext(this, other, true, ctx);
    };

    prototype['Add'] = prototype.Add = function(decfrac, ctx) {
        return ExtendedDecimal.math.Add(this, decfrac, ctx);
    };

    prototype['Quantize'] = prototype.Quantize = function(otherValue, ctx) {
        return ExtendedDecimal.math.Quantize(this, otherValue, ctx);
    };

    prototype['RoundToIntegralExact'] = prototype.RoundToIntegralExact = function(ctx) {
        return ExtendedDecimal.math.RoundToExponentExact(this, BigInteger.ZERO, ctx);
    };

    prototype['RoundToIntegralNoRoundedFlag'] = prototype.RoundToIntegralNoRoundedFlag = function(ctx) {
        return ExtendedDecimal.math.RoundToExponentNoRoundedFlag(this, BigInteger.ZERO, ctx);
    };

    prototype['RoundToExponentExact'] = prototype.RoundToExponentExact = function(exponent, ctx) {
        return ExtendedDecimal.math.RoundToExponentExact(this, exponent, ctx);
    };

    prototype['RoundToExponent'] = prototype.RoundToExponent = function(exponent, ctx) {
        return ExtendedDecimal.math.RoundToExponentSimple(this, exponent, ctx);
    };

    prototype['Multiply'] = prototype.Multiply = function(op, ctx) {
        return ExtendedDecimal.math.Multiply(this, op, ctx);
    };

    prototype['MultiplyAndAdd'] = prototype.MultiplyAndAdd = function(op, augend, ctx) {
        return ExtendedDecimal.math.MultiplyAndAdd(this, op, augend, ctx);
    };

    prototype['MultiplyAndSubtract'] = prototype.MultiplyAndSubtract = function(op, subtrahend, ctx) {
        if ((subtrahend) == null) throw new Error("decfrac");
        var negated = subtrahend;
        if ((subtrahend.flags & BigNumberFlags.FlagNaN) == 0) {
            var newflags = subtrahend.flags ^ BigNumberFlags.FlagNegative;
            negated = ExtendedDecimal.CreateWithFlags(subtrahend.unsignedMantissa, subtrahend.exponent, newflags);
        }
        return ExtendedDecimal.math.MultiplyAndAdd(this, op, negated, ctx);
    };

    prototype['RoundToPrecision'] = prototype.RoundToPrecision = function(ctx) {
        return ExtendedDecimal.math.RoundToPrecision(this, ctx);
    };

    prototype['Plus'] = prototype.Plus = function(ctx) {
        return ExtendedDecimal.math.Plus(this, ctx);
    };

    prototype['RoundToBinaryPrecision'] = prototype.RoundToBinaryPrecision = function(ctx) {
        return ExtendedDecimal.math.RoundToBinaryPrecision(this, ctx);
    };

    prototype['SquareRoot'] = prototype.SquareRoot = function(ctx) {
        return ExtendedDecimal.math.SquareRoot(this, ctx);
    };

    prototype['Exp'] = prototype.Exp = function(ctx) {
        return ExtendedDecimal.math.Exp(this, ctx);
    };

    prototype['Ln'] = prototype.Ln = function(ctx) {
        return ExtendedDecimal.math.Ln(this, ctx);
    };

    constructor['PI'] = constructor.PI = function(ctx) {
        return ExtendedDecimal.math.Pi(ctx);
    };
})(ExtendedDecimal,ExtendedDecimal.prototype);

if(typeof exports!=="undefined")exports['ExtendedDecimal']=ExtendedDecimal;
if(typeof window!=="undefined")window['ExtendedDecimal']=ExtendedDecimal;

var ExtendedFloat =

function(mantissa, exponent) {

    this.exponent = exponent;
    var sign = mantissa.signum();
    this.unsignedMantissa = sign < 0 ? ((mantissa).negate()) : mantissa;
    this.flags = (sign < 0) ? BigNumberFlags.FlagNegative : 0;
};
(function(constructor,prototype){
    prototype['exponent'] = prototype.exponent = null;
    prototype['unsignedMantissa'] = prototype.unsignedMantissa = null;
    prototype['flags'] = prototype.flags = null;
    prototype['getExponent'] = prototype.getExponent = function() {
        return this.exponent;
    };
    prototype['getUnsignedMantissa'] = prototype.getUnsignedMantissa = function() {
        return this.unsignedMantissa;
    };
    prototype['getMantissa'] = prototype.getMantissa = function() {
        return this.isNegative() ? ((this.unsignedMantissa).negate()) : this.unsignedMantissa;
    };
    prototype['EqualsInternal'] = prototype.EqualsInternal = function(otherValue) {
        if (otherValue == null) return false;
        return this.exponent.equals(otherValue.exponent) && this.unsignedMantissa.equals(otherValue.unsignedMantissa) && this.flags == otherValue.flags;
    };
    prototype['equals'] = prototype.equals = function(obj) {
        return this.EqualsInternal((obj.constructor==ExtendedFloat) ? obj : null);
    };
    prototype['hashCode'] = prototype.hashCode = function() {
        var hashCode_ = 0;
        {
            hashCode_ = hashCode_ + 1000000007 * this.exponent.hashCode();
            hashCode_ = hashCode_ + 1000000009 * this.unsignedMantissa.hashCode();
            hashCode_ = hashCode_ + 1000000009 * this.flags;
        }
        return hashCode_;
    };
    constructor['CreateWithFlags'] = constructor.CreateWithFlags = function(mantissa, exponent, flags) {
        var ext = new ExtendedFloat(mantissa, exponent);
        ext.flags = flags;
        return ext;
    };

    constructor['FromString'] = constructor.FromString = function(str, ctx) {
        if (str == null) throw new Error("str");
        return ExtendedDecimal.FromString(str, ctx).ToExtendedFloat();
    };
    constructor['BigShiftIteration'] = constructor.BigShiftIteration = BigInteger.valueOf(1000000);
    constructor['ShiftIteration'] = constructor.ShiftIteration = 1000000;
    constructor['ShiftLeft'] = constructor.ShiftLeft = function(val, bigShift) {
        while (bigShift.compareTo(ExtendedFloat.BigShiftIteration) > 0) {
            val = val.shiftLeft(1000000);
            bigShift = bigShift.subtract(ExtendedFloat.BigShiftIteration);
        }
        var lastshift = bigShift.intValue();
        val = val.shiftLeft(lastshift);
        return val;
    };
    constructor['ShiftLeftInt'] = constructor.ShiftLeftInt = function(val, shift) {
        while (shift > ExtendedFloat.ShiftIteration) {
            val = val.shiftLeft(1000000);
            shift -= ExtendedFloat.ShiftIteration;
        }
        var lastshift = (shift|0);
        val = val.shiftLeft(lastshift);
        return val;
    };
    constructor['BinaryMathHelper'] = constructor.BinaryMathHelper = function ExtendedFloat$BinaryMathHelper(){};
    (function(constructor,prototype){

        prototype['GetRadix'] = prototype.GetRadix = function() {
            return 2;
        };

        prototype['GetSign'] = prototype.GetSign = function(value) {
            return value.signum();
        };

        prototype['GetMantissa'] = prototype.GetMantissa = function(value) {
            return value.unsignedMantissa;
        };

        prototype['GetExponent'] = prototype.GetExponent = function(value) {
            return value.exponent;
        };

        prototype['RescaleByExponentDiff'] = prototype.RescaleByExponentDiff = function(mantissa, e1, e2) {
            var negative = (mantissa.signum() < 0);
            if (negative) mantissa = mantissa.negate();
            var diff = (e1.subtract(e2)).abs();
            mantissa = ExtendedFloat.ShiftLeft(mantissa, diff);
            if (negative) mantissa = mantissa.negate();
            return mantissa;
        };

        prototype['CreateShiftAccumulatorWithDigits'] = prototype.CreateShiftAccumulatorWithDigits = function(bigint, lastDigit, olderDigits) {
            return new BitShiftAccumulator(bigint, lastDigit, olderDigits);
        };

        prototype['CreateShiftAccumulator'] = prototype.CreateShiftAccumulator = function(bigint) {
            return new BitShiftAccumulator(bigint, 0, 0);
        };

        prototype['HasTerminatingRadixExpansion'] = prototype.HasTerminatingRadixExpansion = function(num, den) {
            var gcd = num.gcd(den);
            if (gcd.signum() == 0) return false;
            den = den.divide(gcd);
            while (den.testBit(0) == false) {
                den = den.shiftRight(1);
            }
            return den.equals(BigInteger.ONE);
        };

        prototype['MultiplyByRadixPower'] = prototype.MultiplyByRadixPower = function(bigint, power) {
            if (power.signum() <= 0) return bigint;
            if (power.CanFitInInt32()) {
                return ExtendedFloat.ShiftLeftInt(bigint, power.AsInt32());
            } else {
                return ExtendedFloat.ShiftLeft(bigint, power.AsBigInteger());
            }
        };

        prototype['GetFlags'] = prototype.GetFlags = function(value) {
            return value.unsignedMantissa.signum() < 0 ? BigNumberFlags.FlagNegative : 0;
        };

        prototype['CreateNewWithFlags'] = prototype.CreateNewWithFlags = function(mantissa, exponent, flags) {
            var neg = (flags & BigNumberFlags.FlagNegative) != 0;
            if ((neg && mantissa.signum() > 0) || (!neg && mantissa.signum() < 0)) mantissa = mantissa.negate();
            return new ExtendedFloat(mantissa, exponent);
        };

        prototype['GetArithmeticSupport'] = prototype.GetArithmeticSupport = function() {
            return BigNumberFlags.FiniteOnly;
        };

        prototype['ValueOf'] = prototype.ValueOf = function(val) {
            return ExtendedFloat.FromInt64(val);
        };
    })(ExtendedFloat.BinaryMathHelper,ExtendedFloat.BinaryMathHelper.prototype);

    prototype['ToBigInteger'] = prototype.ToBigInteger = function() {
        var expsign = this.getExponent().signum();
        if (expsign == 0) {

            return this.getMantissa();
        } else if (expsign > 0) {

            var curexp = this.getExponent();
            var bigmantissa = this.getMantissa();
            if (bigmantissa.signum() == 0) return bigmantissa;
            var neg = (bigmantissa.signum() < 0);
            if (neg) bigmantissa = bigmantissa.negate();
            while (curexp.signum() > 0 && bigmantissa.signum() != 0) {
                var shift = 4096;
                if (curexp.compareTo(BigInteger.valueOf(shift)) < 0) {
                    shift = curexp.intValue();
                }
                bigmantissa = bigmantissa.shiftLeft(shift);
                curexp = curexp.subtract(BigInteger.valueOf(shift));
            }
            if (neg) bigmantissa = bigmantissa.negate();
            return bigmantissa;
        } else {

            var curexp = this.getExponent();
            var bigmantissa = this.getMantissa();
            if (bigmantissa.signum() == 0) return bigmantissa;
            var neg = (bigmantissa.signum() < 0);
            if (neg) bigmantissa = bigmantissa.negate();
            while (curexp.signum() < 0 && bigmantissa.signum() != 0) {
                var shift = 4096;
                if (curexp.compareTo(BigInteger.valueOf(-4096)) > 0) {
                    shift = -(curexp.intValue());
                }
                bigmantissa = bigmantissa.shiftRight(shift);
                curexp = curexp.add(BigInteger.valueOf(shift));
            }
            if (neg) bigmantissa = bigmantissa.negate();
            return bigmantissa;
        }
    };
    constructor['OneShift23'] = constructor.OneShift23 = BigInteger.ONE.shiftLeft(23);
    constructor['OneShift52'] = constructor.OneShift52 = BigInteger.ONE.shiftLeft(52);

    prototype['ToSingle'] = prototype.ToSingle = function() {
        if (this.IsPositiveInfinity()) return Number.POSITIVE_INFINITY;
        if (this.IsNegativeInfinity()) return Number.NEGATIVE_INFINITY;
        if (this.IsNaN()) {
            var nan = 2139095041;
            if (this.isNegative()) nan |= ((1 << 31)|0);
            if (this.IsQuietNaN()) nan |= 4194304; else {

                nan |= 2097152;
            }
            if (!(this.getUnsignedMantissa().signum() == 0)) {

                var bigdata = (this.getUnsignedMantissa().remainder(BigInteger.valueOf(2097152)));
                nan |= bigdata.intValue();
            }
            return Float.intBitsToFloat(nan);
        }
        if (this.isNegative() && this.signum() == 0) {
            return Float.intBitsToFloat(1 << 31);
        }
        var bigmant = (this.unsignedMantissa).abs();
        var bigexponent = FastInteger.FromBig(this.exponent);
        var bitLeftmost = 0;
        var bitsAfterLeftmost = 0;
        if (this.unsignedMantissa.signum() == 0) {
            return 0.0;
        }
        var smallmant = 0;
        var fastSmallMant;
        if (bigmant.compareTo(ExtendedFloat.OneShift23) < 0) {
            smallmant = bigmant.intValue();
            var exponentchange = 0;
            while (smallmant < (1 << 23)) {
                smallmant <<= 1;
                exponentchange++;
            }
            bigexponent.SubtractInt(exponentchange);
            fastSmallMant = new FastInteger(smallmant);
        } else {
            var accum = new BitShiftAccumulator(bigmant, 0, 0);
            accum.ShiftToDigitsInt(24);
            bitsAfterLeftmost = accum.getOlderDiscardedDigits();
            bitLeftmost = accum.getLastDiscardedDigit();
            bigexponent.Add(accum.getDiscardedDigitCount());
            fastSmallMant = accum.getShiftedIntFast();
        }

        if (bitLeftmost > 0 && (bitsAfterLeftmost > 0 || !fastSmallMant.isEvenNumber())) {
            fastSmallMant.Increment();
            if (fastSmallMant.CompareToInt(1 << 24) == 0) {
                fastSmallMant = new FastInteger(1 << 23);
                bigexponent.Increment();
            }
        }
        var subnormal = false;
        if (bigexponent.CompareToInt(104) > 0) {

            return (this.isNegative()) ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
        } else if (bigexponent.CompareToInt(-149) < 0) {

            subnormal = true;

            var accum = BitShiftAccumulator.FromInt32(fastSmallMant.AsInt32());
            var fi = FastInteger.Copy(bigexponent).SubtractInt(-149).Abs();
            accum.ShiftRight(fi);
            bitsAfterLeftmost = accum.getOlderDiscardedDigits();
            bitLeftmost = accum.getLastDiscardedDigit();
            bigexponent.Add(accum.getDiscardedDigitCount());
            fastSmallMant = accum.getShiftedIntFast();

            if (bitLeftmost > 0 && (bitsAfterLeftmost > 0 || !fastSmallMant.isEvenNumber())) {
                fastSmallMant.Increment();
                if (fastSmallMant.CompareToInt(1 << 24) == 0) {
                    fastSmallMant = new FastInteger(1 << 23);
                    bigexponent.Increment();
                }
            }
        }
        if (bigexponent.CompareToInt(-149) < 0) {

            return (this.isNegative()) ? Float.intBitsToFloat(1 << 31) : Float.intBitsToFloat(0);
        } else {
            var smallexponent = bigexponent.AsInt32();
            smallexponent = smallexponent + 150;
            var smallmantissa = ((fastSmallMant.AsInt32())|0) & 8388607;
            if (!subnormal) {
                smallmantissa |= (smallexponent << 23);
            }
            if (this.isNegative()) smallmantissa |= (1 << 31);
            return Float.intBitsToFloat(smallmantissa);
        }
    };

    prototype['ToDouble'] = prototype.ToDouble = function() {
        if (this.IsPositiveInfinity()) return Number.POSITIVE_INFINITY;
        if (this.IsNegativeInfinity()) return Number.NEGATIVE_INFINITY;
        if (this.IsNaN()) {
            var nan = [1, 2146435072];
            if (this.isNegative()) nan[1] = nan[1] | ((1 << 31)|0);
            if (this.IsQuietNaN()) nan[1] = nan[1] | 524288; else {

                nan[1] = nan[1] | 262144;
            }
            if (!(this.getUnsignedMantissa().signum() == 0)) {

                var words = FastInteger.GetLastWords(this.getUnsignedMantissa(), 2);
                nan[0] = words[0];
                nan[1] = (words[1] & 262143);
            }
            return Extras.IntegersToDouble(nan);
        }
        if (this.isNegative() && this.signum() == 0) {
            return Extras.IntegersToDouble([((1 << 31)|0), 0]);
        }
        var bigmant = (this.unsignedMantissa).abs();
        var bigexponent = FastInteger.FromBig(this.exponent);
        var bitLeftmost = 0;
        var bitsAfterLeftmost = 0;
        if (this.unsignedMantissa.signum() == 0) {
            return 0.0;
        }
        var mantissaBits;
        if (bigmant.compareTo(ExtendedFloat.OneShift52) < 0) {
            mantissaBits = FastInteger.GetLastWords(bigmant, 2);

            while (!DecimalUtility.HasBitSet(mantissaBits, 52)) {
                DecimalUtility.ShiftLeftOne(mantissaBits);
                bigexponent.Decrement();
            }
        } else {
            var accum = new BitShiftAccumulator(bigmant, 0, 0);
            accum.ShiftToDigitsInt(53);
            bitsAfterLeftmost = accum.getOlderDiscardedDigits();
            bitLeftmost = accum.getLastDiscardedDigit();
            bigexponent.Add(accum.getDiscardedDigitCount());
            mantissaBits = FastInteger.GetLastWords(accum.getShiftedInt(), 2);
        }

        if (bitLeftmost > 0 && (bitsAfterLeftmost > 0 || DecimalUtility.HasBitSet(mantissaBits, 0))) {

            mantissaBits[0] = ((mantissaBits[0] + 1)|0);
            if (mantissaBits[0] == 0) mantissaBits[1] = ((mantissaBits[1] + 1)|0);
            if (mantissaBits[0] == 0 && mantissaBits[1] == (1 << 21)) {

                mantissaBits[1] = mantissaBits[1] >> 1;

                bigexponent.Increment();
            }
        }
        var subnormal = false;
        if (bigexponent.CompareToInt(971) > 0) {

            return (this.isNegative()) ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
        } else if (bigexponent.CompareToInt(-1074) < 0) {

            subnormal = true;

            var accum = new BitShiftAccumulator(FastInteger.WordsToBigInteger(mantissaBits), 0, 0);
            var fi = FastInteger.Copy(bigexponent).SubtractInt(-1074).Abs();
            accum.ShiftRight(fi);
            bitsAfterLeftmost = accum.getOlderDiscardedDigits();
            bitLeftmost = accum.getLastDiscardedDigit();
            bigexponent.Add(accum.getDiscardedDigitCount());
            mantissaBits = FastInteger.GetLastWords(accum.getShiftedInt(), 2);

            if (bitLeftmost > 0 && (bitsAfterLeftmost > 0 || DecimalUtility.HasBitSet(mantissaBits, 0))) {

                mantissaBits[0] = ((mantissaBits[0] + 1)|0);
                if (mantissaBits[0] == 0) mantissaBits[1] = ((mantissaBits[1] + 1)|0);
                if (mantissaBits[0] == 0 && mantissaBits[1] == (1 << 21)) {

                    mantissaBits[1] = mantissaBits[1] >> 1;

                    bigexponent.Increment();
                }
            }
        }
        if (bigexponent.CompareToInt(-1074) < 0) {

            return (this.isNegative()) ? Extras.IntegersToDouble([0, ((-2147483648)|0)]) : 0.0;
        } else {
            bigexponent.AddInt(1075);

            mantissaBits[1] = mantissaBits[1] & 1048575;
            if (!subnormal) {
                var smallexponent = bigexponent.AsInt32() << 20;
                mantissaBits[1] = mantissaBits[1] | smallexponent;
            }
            if (this.isNegative()) {
                mantissaBits[1] = mantissaBits[1] | ((1 << 31)|0);
            }
            return Extras.IntegersToDouble(mantissaBits);
        }
    };

    constructor['FromSingle'] = constructor.FromSingle = function(flt) {
        var value = Float.floatToRawIntBits(flt);
        var neg = ((value >> 31) != 0);
        var fpExponent = ((value >> 23) & 255);
        var fpMantissa = value & 8388607;
        var bigmant;
        if (fpExponent == 255) {
            if (fpMantissa == 0) {
                return neg ? ExtendedFloat.NegativeInfinity : ExtendedFloat.PositiveInfinity;
            }

            var quiet = (fpMantissa & 4194304) != 0;
            fpMantissa &= 2097151;
            bigmant = BigInteger.valueOf(fpMantissa);
            bigmant = bigmant.subtract(BigInteger.ONE);
            if (bigmant.signum() == 0) {
                return quiet ? ExtendedFloat.NaN : ExtendedFloat.SignalingNaN;
            } else {
                return ExtendedFloat.CreateWithFlags(bigmant, BigInteger.ZERO, (neg ? BigNumberFlags.FlagNegative : 0) | (quiet ? BigNumberFlags.FlagQuietNaN : BigNumberFlags.FlagSignalingNaN));
            }
        }
        if (fpExponent == 0) fpExponent++; else fpMantissa |= (1 << 23);
        if (fpMantissa == 0) {
            return neg ? ExtendedFloat.NegativeZero : ExtendedFloat.Zero;
        }
        while ((fpMantissa & 1) == 0) {
            fpExponent++;
            fpMantissa >>= 1;
        }
        if (neg) fpMantissa = -fpMantissa;
        bigmant = BigInteger.valueOf(fpMantissa);
        return new ExtendedFloat(bigmant, BigInteger.valueOf(fpExponent - 150));
    };
    constructor['FromBigInteger'] = constructor.FromBigInteger = function(bigint) {
        return new ExtendedFloat(bigint, BigInteger.ZERO);
    };
    constructor['FromInt64'] = constructor.FromInt64 = function(valueSmall_obj) {
        var valueSmall = JSInteropFactory.createLong(valueSmall_obj);
        var bigint = BigInteger.valueOf(valueSmall);
        return new ExtendedFloat(bigint, BigInteger.ZERO);
    };

    constructor['FromDouble'] = constructor.FromDouble = function(dbl) {
        var value = Extras.DoubleToIntegers(dbl);
        var fpExponent = ((value[1] >> 20) & 2047);
        var neg = (value[1] >> 31) != 0;
        if (fpExponent == 2047) {
            if ((value[1] & 1048575) == 0 && value[0] == 0) {
                return neg ? ExtendedFloat.NegativeInfinity : ExtendedFloat.PositiveInfinity;
            }

            var quiet = (value[1] & 524288) != 0;
            value[1] = value[1] & 262143;
            var info = FastInteger.WordsToBigInteger(value);
            info = info.subtract(BigInteger.ONE);
            if (info.signum() == 0) {
                return quiet ? ExtendedFloat.NaN : ExtendedFloat.SignalingNaN;
            } else {
                return ExtendedFloat.CreateWithFlags(info, BigInteger.ZERO, (neg ? BigNumberFlags.FlagNegative : 0) | (quiet ? BigNumberFlags.FlagQuietNaN : BigNumberFlags.FlagSignalingNaN));
            }
        }
        value[1] = value[1] & 1048575;

        if (fpExponent == 0) fpExponent++; else value[1] = value[1] | 1048576;
        if ((value[1] | value[0]) != 0) {
            fpExponent = fpExponent + (DecimalUtility.ShiftAwayTrailingZerosTwoElements(value));
        } else {
            return neg ? ExtendedFloat.NegativeZero : ExtendedFloat.Zero;
        }
        return ExtendedFloat.CreateWithFlags(FastInteger.WordsToBigInteger(value), BigInteger.valueOf(fpExponent - 1075), (neg ? BigNumberFlags.FlagNegative : 0));
    };

    prototype['ToExtendedDecimal'] = prototype.ToExtendedDecimal = function() {
        return ExtendedDecimal.FromExtendedFloat(this);
    };

    prototype['toString'] = prototype.toString = function() {
        return ExtendedDecimal.FromExtendedFloat(this).toString();
    };

    prototype['ToEngineeringString'] = prototype.ToEngineeringString = function() {
        return this.ToExtendedDecimal().ToEngineeringString();
    };

    prototype['ToPlainString'] = prototype.ToPlainString = function() {
        return this.ToExtendedDecimal().ToPlainString();
    };
    constructor['One'] = constructor.One = new ExtendedFloat(BigInteger.ONE, BigInteger.ZERO);
    constructor['Zero'] = constructor.Zero = new ExtendedFloat(BigInteger.ZERO, BigInteger.ZERO);
    constructor['NegativeZero'] = constructor.NegativeZero = ExtendedFloat.CreateWithFlags(BigInteger.ZERO, BigInteger.ZERO, BigNumberFlags.FlagNegative);
    constructor['Ten'] = constructor.Ten = new ExtendedFloat(BigInteger.TEN, BigInteger.ZERO);
    constructor['NaN'] = constructor.NaN = ExtendedFloat.CreateWithFlags(BigInteger.ZERO, BigInteger.ZERO, BigNumberFlags.FlagQuietNaN);
    constructor['SignalingNaN'] = constructor.SignalingNaN = ExtendedFloat.CreateWithFlags(BigInteger.ZERO, BigInteger.ZERO, BigNumberFlags.FlagSignalingNaN);
    constructor['PositiveInfinity'] = constructor.PositiveInfinity = ExtendedFloat.CreateWithFlags(BigInteger.ZERO, BigInteger.ZERO, BigNumberFlags.FlagInfinity);
    constructor['NegativeInfinity'] = constructor.NegativeInfinity = ExtendedFloat.CreateWithFlags(BigInteger.ZERO, BigInteger.ZERO, BigNumberFlags.FlagInfinity | BigNumberFlags.FlagNegative);

    prototype['IsPositiveInfinity'] = prototype.IsPositiveInfinity = function() {
        return (this.flags & (BigNumberFlags.FlagInfinity | BigNumberFlags.FlagNegative)) == (BigNumberFlags.FlagInfinity | BigNumberFlags.FlagNegative);
    };

    prototype['IsNegativeInfinity'] = prototype.IsNegativeInfinity = function() {
        return (this.flags & (BigNumberFlags.FlagInfinity | BigNumberFlags.FlagNegative)) == (BigNumberFlags.FlagInfinity);
    };

    prototype['IsNaN'] = prototype.IsNaN = function() {
        return (this.flags & (BigNumberFlags.FlagQuietNaN | BigNumberFlags.FlagSignalingNaN)) != 0;
    };

    prototype['IsInfinity'] = prototype.IsInfinity = function() {
        return (this.flags & (BigNumberFlags.FlagInfinity)) != 0;
    };

    prototype['isNegative'] = prototype.isNegative = function() {
        return (this.flags & (BigNumberFlags.FlagNegative)) != 0;
    };

    prototype['IsQuietNaN'] = prototype.IsQuietNaN = function() {
        return (this.flags & (BigNumberFlags.FlagQuietNaN)) != 0;
    };

    prototype['IsSignalingNaN'] = prototype.IsSignalingNaN = function() {
        return (this.flags & (BigNumberFlags.FlagSignalingNaN)) != 0;
    };

    prototype['signum'] = prototype.signum = function() {
        return (((this.flags & BigNumberFlags.FlagSpecial) == 0) && this.unsignedMantissa.signum() == 0) ? 0 : (((this.flags & BigNumberFlags.FlagNegative) != 0) ? -1 : 1);
    };

    prototype['isZero'] = prototype.isZero = function() {
        return ((this.flags & BigNumberFlags.FlagSpecial) == 0) && this.unsignedMantissa.signum() == 0;
    };

    prototype['DivideToSameExponent'] = prototype.DivideToSameExponent = function(divisor, rounding) {
        return this.DivideToExponent(divisor, this.exponent, PrecisionContext.ForRounding(rounding));
    };

    prototype['Reduce'] = prototype.Reduce = function(ctx) {
        return ExtendedFloat.math.Reduce(this, ctx);
    };

    prototype['RemainderNaturalScale'] = prototype.RemainderNaturalScale = function(divisor, ctx) {
        return this.Subtract(this.DivideToIntegerNaturalScale(divisor, null).Multiply(divisor, null), ctx);
    };

    prototype['Divide'] = prototype.Divide = function(divisor, ctx) {
        return ExtendedFloat.math.Divide(this, divisor, ctx);
    };

    prototype['DivideToExponent'] = prototype.DivideToExponent = function(divisor, exponent, ctx) {
        return ExtendedFloat.math.DivideToExponent(this, divisor, exponent, ctx);
    };

    prototype['Abs'] = prototype.Abs = function(context) {
        return ExtendedFloat.math.Abs(this, context);
    };

    prototype['Negate'] = prototype.Negate = function(context) {
        return ExtendedFloat.math.Negate(this, context);
    };

    prototype['Subtract'] = prototype.Subtract = function(decfrac, ctx) {
        if ((decfrac) == null) throw new Error("decfrac");
        var negated = decfrac;
        if ((decfrac.flags & BigNumberFlags.FlagNaN) == 0) {
            var newflags = decfrac.flags ^ BigNumberFlags.FlagNegative;
            negated = ExtendedFloat.CreateWithFlags(decfrac.unsignedMantissa, decfrac.exponent, newflags);
        }
        return this.Add(negated, ctx);
    };
    constructor['math'] = constructor.math = new RadixMath(new ExtendedFloat.BinaryMathHelper());

    prototype['DivideToIntegerNaturalScale'] = prototype.DivideToIntegerNaturalScale = function(divisor, ctx) {
        return ExtendedFloat.math.DivideToIntegerNaturalScale(this, divisor, ctx);
    };

    prototype['DivideToIntegerZeroScale'] = prototype.DivideToIntegerZeroScale = function(divisor, ctx) {
        return ExtendedFloat.math.DivideToIntegerZeroScale(this, divisor, ctx);
    };

    prototype['Remainder'] = prototype.Remainder = function(divisor, ctx) {
        return ExtendedFloat.math.Remainder(this, divisor, ctx);
    };

    prototype['RemainderNear'] = prototype.RemainderNear = function(divisor, ctx) {
        return ExtendedFloat.math.RemainderNear(this, divisor, ctx);
    };

    prototype['NextMinus'] = prototype.NextMinus = function(ctx) {
        return ExtendedFloat.math.NextMinus(this, ctx);
    };

    prototype['NextPlus'] = prototype.NextPlus = function(ctx) {
        return ExtendedFloat.math.NextPlus(this, ctx);
    };

    prototype['NextToward'] = prototype.NextToward = function(otherValue, ctx) {
        return ExtendedFloat.math.NextToward(this, otherValue, ctx);
    };

    constructor['Max'] = constructor.Max = function(first, second, ctx) {
        return ExtendedFloat.math.Max(first, second, ctx);
    };

    constructor['Min'] = constructor.Min = function(first, second, ctx) {
        return ExtendedFloat.math.Min(first, second, ctx);
    };

    constructor['MaxMagnitude'] = constructor.MaxMagnitude = function(first, second, ctx) {
        return ExtendedFloat.math.MaxMagnitude(first, second, ctx);
    };

    constructor['MinMagnitude'] = constructor.MinMagnitude = function(first, second, ctx) {
        return ExtendedFloat.math.MinMagnitude(first, second, ctx);
    };

    prototype['compareTo'] = prototype.compareTo = function(other) {
        return ExtendedFloat.math.compareTo(this, other);
    };

    prototype['CompareToWithContext'] = prototype.CompareToWithContext = function(other, ctx) {
        return ExtendedFloat.math.CompareToWithContext(this, other, false, ctx);
    };

    prototype['CompareToSignal'] = prototype.CompareToSignal = function(other, ctx) {
        return ExtendedFloat.math.CompareToWithContext(this, other, true, ctx);
    };

    prototype['Add'] = prototype.Add = function(decfrac, ctx) {
        return ExtendedFloat.math.Add(this, decfrac, ctx);
    };

    prototype['Quantize'] = prototype.Quantize = function(otherValue, ctx) {
        return ExtendedFloat.math.Quantize(this, otherValue, ctx);
    };

    prototype['RoundToIntegralExact'] = prototype.RoundToIntegralExact = function(ctx) {
        return ExtendedFloat.math.RoundToExponentExact(this, BigInteger.ZERO, ctx);
    };

    prototype['RoundToIntegralNoRoundedFlag'] = prototype.RoundToIntegralNoRoundedFlag = function(ctx) {
        return ExtendedFloat.math.RoundToExponentNoRoundedFlag(this, BigInteger.ZERO, ctx);
    };

    prototype['RoundToExponentExact'] = prototype.RoundToExponentExact = function(exponent, ctx) {
        return ExtendedFloat.math.RoundToExponentExact(this, exponent, ctx);
    };

    prototype['RoundToExponent'] = prototype.RoundToExponent = function(exponent, ctx) {
        return ExtendedFloat.math.RoundToExponentSimple(this, exponent, ctx);
    };

    prototype['Multiply'] = prototype.Multiply = function(op, ctx) {
        return ExtendedFloat.math.Multiply(this, op, ctx);
    };

    prototype['MultiplyAndAdd'] = prototype.MultiplyAndAdd = function(op, augend, ctx) {
        return ExtendedFloat.math.MultiplyAndAdd(this, op, augend, ctx);
    };

    prototype['MultiplyAndSubtract'] = prototype.MultiplyAndSubtract = function(op, subtrahend, ctx) {
        if ((subtrahend) == null) throw new Error("decfrac");
        var negated = subtrahend;
        if ((subtrahend.flags & BigNumberFlags.FlagNaN) == 0) {
            var newflags = subtrahend.flags ^ BigNumberFlags.FlagNegative;
            negated = ExtendedFloat.CreateWithFlags(subtrahend.unsignedMantissa, subtrahend.exponent, newflags);
        }
        return ExtendedFloat.math.MultiplyAndAdd(this, op, negated, ctx);
    };

    prototype['RoundToPrecision'] = prototype.RoundToPrecision = function(ctx) {
        return ExtendedFloat.math.RoundToPrecision(this, ctx);
    };

    prototype['Plus'] = prototype.Plus = function(ctx) {
        return ExtendedFloat.math.Plus(this, ctx);
    };

    prototype['RoundToBinaryPrecision'] = prototype.RoundToBinaryPrecision = function(ctx) {
        return ExtendedFloat.math.RoundToBinaryPrecision(this, ctx);
    };

    prototype['SquareRoot'] = prototype.SquareRoot = function(ctx) {
        return ExtendedFloat.math.SquareRoot(this, ctx);
    };

    prototype['Exp'] = prototype.Exp = function(ctx) {
        return ExtendedFloat.math.Exp(this, ctx);
    };

    constructor['PI'] = constructor.PI = function(ctx) {
        return ExtendedFloat.math.Pi(ctx);
    };
})(ExtendedFloat,ExtendedFloat.prototype);

if(typeof exports!=="undefined")exports['ExtendedFloat']=ExtendedFloat;
if(typeof window!=="undefined")window['ExtendedFloat']=ExtendedFloat;

})();

