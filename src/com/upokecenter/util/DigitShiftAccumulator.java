package com.upokecenter.util;
/*
Written in 2013 by Peter O.
Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://peteroupc.github.io/CBOR/
 */

//import java.math.*;

  final class DigitShiftAccumulator implements IShiftAccumulator {
    int bitLeftmost;

    /**
     * Gets whether the last discarded digit was set.
     */
    public int getLastDiscardedDigit() { return bitLeftmost; }
    int bitsAfterLeftmost;

    /**
     * Gets whether any of the discarded digits to the right of the last one
     * was set.
     */
    public int getOlderDiscardedDigits() { return bitsAfterLeftmost; }
    BigInteger shiftedBigInt;
    FastInteger knownBitLength;

    /**
     *
     * @return A FastInteger object.
     */
    public FastInteger GetDigitLength() {
      if (knownBitLength==null) {
        knownBitLength = CalcKnownDigitLength();
      }
      return FastInteger.Copy(knownBitLength);
    }

    int shiftedSmall;
    boolean isSmall;

    FastInteger discardedBitCount;

    /**
     *
     */
    public FastInteger getDiscardedDigitCount() {
        if(discardedBitCount==null)
          discardedBitCount=new FastInteger(0);
        return discardedBitCount;
      }
    private static BigInteger Int32MaxValue = BigInteger.valueOf(Integer.MAX_VALUE);
    private static BigInteger Ten = BigInteger.TEN;

    /**
     *
     */
    public BigInteger getShiftedInt() {
        if(isSmall)
          return BigInteger.valueOf(shiftedSmall);
        else
          return shiftedBigInt;
      }

    public DigitShiftAccumulator (BigInteger bigint,
                                 int lastDiscarded,
                                 int olderDiscarded
                                ) {
      if(bigint.canFitInInt()){
        shiftedSmall=bigint.intValue();
        if(shiftedSmall<0)
          throw new IllegalArgumentException("bigint is negative");
        isSmall=true;
      } else {
        shiftedBigInt = bigint;
        isSmall = false;
      }
      bitsAfterLeftmost = (olderDiscarded != 0) ? 1 : 0;
      bitLeftmost = lastDiscarded;
    }

    private static int FastParseLong(String str, int offset, int length) {
      // Assumes the String is length 9 or less and contains
      // only the digits '0' through '9'
      if((length)>9)throw new IllegalArgumentException(
        "length"+" not less or equal to "+"9"+" ("+(length)+")");
      int ret = 0;
      for (int i = 0; i < length; i++) {
        int digit = (int)(str.charAt(offset + i) - '0');
        ret *= 10;
        ret += digit;
      }
      return ret;
    }

    /**
     *
     */
    public FastInteger getShiftedIntFast() {
        if (isSmall){
          return new FastInteger(shiftedSmall);
        } else {
          return FastInteger.FromBig(shiftedBigInt);
        }
      }
    /**
     *
     * @param fastint A FastInteger object.
     */
    public void ShiftRight(FastInteger fastint) {
      if ((fastint) == null) throw new NullPointerException("fastint");
      if (fastint.signum() <= 0) return;
      if (fastint.CanFitInInt32()) {
        ShiftRightInt(fastint.AsInt32());
      } else {
        BigInteger bi = fastint.AsBigInteger();
        while (bi.signum() > 0) {
          int count = 1000000;
          if (bi.compareTo(BigInteger.valueOf(1000000)) < 0) {
            count = bi.intValue();
          }
          ShiftRightInt(count);
          bi=bi.subtract(BigInteger.valueOf(count));
          if(isSmall ? shiftedSmall==0 : shiftedBigInt.signum()==0){
            break;
          }
        }
      }
    }

    private void ShiftRightBig(int digits) {
      if (digits <= 0) return;
      if (shiftedBigInt.signum()==0) {
        if(discardedBitCount==null)
          discardedBitCount=new FastInteger(0);
        discardedBitCount.AddInt(digits);
        bitsAfterLeftmost |= bitLeftmost;
        bitLeftmost = 0;
        knownBitLength = new FastInteger(1);
        return;
      }
      //System.out.println("digits={0}",digits);
      if(digits==1){
        BigInteger bigrem;
        BigInteger bigquo;
{
BigInteger[] divrem=(shiftedBigInt).divideAndRemainder(BigInteger.TEN);
bigquo=divrem[0];
bigrem=divrem[1]; }
        bitsAfterLeftmost|=bitLeftmost;
        bitLeftmost=bigrem.intValue();
        shiftedBigInt=bigquo;
        if(discardedBitCount==null)
          discardedBitCount=new FastInteger(0);
        discardedBitCount.AddInt(digits);
        if(knownBitLength!=null){
          if(bigquo.signum()==0)
            knownBitLength.SetInt(0);
          else
            knownBitLength.Decrement();
        }
        return;
      }
      int startCount=Math.min(4,digits-1);
      if(startCount>0){
        BigInteger bigrem;
        BigInteger radixPower=DecimalUtility.FindPowerOfTen(startCount);
        BigInteger bigquo;
{
BigInteger[] divrem=(shiftedBigInt).divideAndRemainder(radixPower);
bigquo=divrem[0];
bigrem=divrem[1]; }
        if(bigrem.signum()!=0)
          bitsAfterLeftmost|=1;
        bitsAfterLeftmost|=bitLeftmost;
        shiftedBigInt=bigquo;
        if(discardedBitCount==null)
          discardedBitCount=new FastInteger(0);
        discardedBitCount.AddInt(startCount);
        digits-=startCount;
        if(shiftedBigInt.signum()==0){
          // Shifted all the way to 0
          isSmall=true;
          shiftedSmall=0;
          knownBitLength=new FastInteger(1);
          bitsAfterLeftmost = (bitsAfterLeftmost != 0) ? 1 : 0;
          bitLeftmost=0;
          return;
        }
      }
      if(digits==1){
        BigInteger bigrem;
        BigInteger bigquo;
{
BigInteger[] divrem=(shiftedBigInt).divideAndRemainder(Ten);
bigquo=divrem[0];
bigrem=divrem[1]; }
        bitsAfterLeftmost|=bitLeftmost;
        bitLeftmost=bigrem.intValue();
        shiftedBigInt=bigquo;
        if(discardedBitCount==null)
          discardedBitCount=new FastInteger(0);
        discardedBitCount.Increment();
        if(knownBitLength==null)
          knownBitLength=GetDigitLength();
        else
          knownBitLength.Decrement();
        bitsAfterLeftmost = (bitsAfterLeftmost != 0) ? 1 : 0;
        return;
      }
      if(knownBitLength==null)
        knownBitLength=GetDigitLength();
      if(new FastInteger(digits).Decrement().compareTo(knownBitLength)>=0){
        // Shifting more bits than available
        bitsAfterLeftmost |= (shiftedBigInt.signum()==0 ? 0 : 1);
        isSmall=true;
        shiftedSmall=0;
        knownBitLength=new FastInteger(1);
        if(discardedBitCount==null)
          discardedBitCount=new FastInteger(0);
        discardedBitCount.AddInt(digits);
        bitsAfterLeftmost |= bitLeftmost;
        bitLeftmost = 0;
        return;
      }
      if(shiftedBigInt.canFitInInt()){
        isSmall=true;
        shiftedSmall=shiftedBigInt.intValue();
        this.ShiftRightSmall(digits);
        return;
      }
      String str = shiftedBigInt.toString();
      // NOTE: Will be 1 if the value is 0
      int digitLength = str.length();
      int bitDiff = 0;
      if (digits > digitLength) {
        bitDiff = digits - digitLength;
      }
      if(discardedBitCount==null)
        discardedBitCount=new FastInteger(0);
      discardedBitCount.AddInt(digits);
      bitsAfterLeftmost |= bitLeftmost;
      int digitShift = Math.min(digitLength, digits);
      if (digits >= digitLength) {
        isSmall = true;
        shiftedSmall = 0;
        knownBitLength = new FastInteger(1);
      } else {
        int newLength = (int)(digitLength - digitShift);
        knownBitLength = new FastInteger(newLength);
        if (newLength <= 9) {
          // Fits in a small number
          isSmall = true;
          shiftedSmall = FastParseLong(str, 0, newLength);
        } else {
          shiftedBigInt = BigInteger.fromSubstring(str, 0, newLength);
        }
      }
      for (int i = str.length() - 1; i >= 0; i--) {
        bitsAfterLeftmost |= bitLeftmost;
        bitLeftmost = (int)(str.charAt(i) - '0');
        digitShift--;
        if (digitShift <= 0) {
          break;
        }
      }
      bitsAfterLeftmost = (bitsAfterLeftmost != 0) ? 1 : 0;
      if (bitDiff > 0) {
        // Shifted more digits than the digit length
        bitsAfterLeftmost |= bitLeftmost;
        bitLeftmost = 0;
      }
    }

    /**
     * Shifts a number until it reaches the given number of digits, gathering
     * information on whether the last digit discarded is set and whether
     * the discarded digits to the right of that digit are set. Assumes that
     * the big integer being shifted is positive.
     */
    private void ShiftToBitsBig(int digits) {
      if(knownBitLength!=null){
        if(knownBitLength.CompareToInt(digits)<=0){
          return;
        }
      }
      String str;
      if(knownBitLength==null)
        knownBitLength=GetDigitLength();
      if(knownBitLength.CompareToInt(digits)<=0){
        return;
      }
      FastInteger digitDiff=FastInteger.Copy(knownBitLength).SubtractInt(digits);
      if(digitDiff.CompareToInt(1)==0){
        BigInteger bigrem;
        BigInteger bigquo;
{
BigInteger[] divrem=(shiftedBigInt).divideAndRemainder(Ten);
bigquo=divrem[0];
bigrem=divrem[1]; }
        bitsAfterLeftmost|=bitLeftmost;
        bitLeftmost=bigrem.intValue();
        shiftedBigInt=bigquo;
        if(discardedBitCount==null)
          discardedBitCount=new FastInteger(0);
        discardedBitCount.Add(digitDiff);
        knownBitLength.Subtract(digitDiff);
        bitsAfterLeftmost = (bitsAfterLeftmost != 0) ? 1 : 0;
        return;
      } else if(digitDiff.CompareToInt(9)<=0){
        BigInteger bigrem;
        int diffInt=digitDiff.AsInt32();
        BigInteger radixPower=DecimalUtility.FindPowerOfTen(diffInt);
        BigInteger bigquo;
{
BigInteger[] divrem=(shiftedBigInt).divideAndRemainder(radixPower);
bigquo=divrem[0];
bigrem=divrem[1]; }
        int rem=bigrem.intValue();
        bitsAfterLeftmost|=bitLeftmost;
        for(int i=0;i<diffInt;i++){
          if(i==diffInt-1){
            bitLeftmost=rem%10;
          } else {
            bitsAfterLeftmost|=(rem%10);
            rem/=10;
          }
        }
        shiftedBigInt=bigquo;
        if(discardedBitCount==null)
          discardedBitCount=new FastInteger(0);
        discardedBitCount.Add(digitDiff);
        knownBitLength.Subtract(digitDiff);
        bitsAfterLeftmost = (bitsAfterLeftmost != 0) ? 1 : 0;
        return;
      } else if(digitDiff.CompareToInt(Integer.MAX_VALUE)<=0){
        BigInteger bigrem;
        BigInteger radixPower=DecimalUtility.FindPowerOfTen(digitDiff.AsInt32()-1);
        BigInteger bigquo;
{
BigInteger[] divrem=(shiftedBigInt).divideAndRemainder(radixPower);
bigquo=divrem[0];
bigrem=divrem[1]; }
        bitsAfterLeftmost|=bitLeftmost;
        if(bigrem.signum()!=0)
          bitsAfterLeftmost|=1;
        {
          BigInteger bigquo2;
{
BigInteger[] divrem=(bigquo).divideAndRemainder(Ten);
bigquo2=divrem[0];
bigrem=divrem[1]; }
          this.bitLeftmost=bigrem.intValue();
          shiftedBigInt=bigquo2;
        }
        if(discardedBitCount==null)
          discardedBitCount=new FastInteger(0);
        discardedBitCount.Add(digitDiff);
        knownBitLength.Subtract(digitDiff);
        bitsAfterLeftmost = (bitsAfterLeftmost != 0) ? 1 : 0;
        return;
      }
      str=shiftedBigInt.toString();
      // NOTE: Will be 1 if the value is 0
      int digitLength = str.length();
      knownBitLength = new FastInteger(digitLength);
      // Shift by the difference in digit length
      if (digitLength > digits) {
        int digitShift = digitLength - digits;
        knownBitLength.SubtractInt(digitShift);
        int newLength = (int)(digitLength - digitShift);
        //System.out.println("dlen={0} dshift={1} newlen={2}",digitLength,
        //                digitShift,newLength);
        if(discardedBitCount==null)
          discardedBitCount=new FastInteger(0);
        if(digitShift<=Integer.MAX_VALUE)
          discardedBitCount.AddInt((int)digitShift);
        else
          discardedBitCount.AddBig(BigInteger.valueOf(digitShift));
        for (int i = str.length() - 1; i >= 0; i--) {
          bitsAfterLeftmost |= bitLeftmost;
          bitLeftmost = (int)(str.charAt(i) - '0');
          digitShift--;
          if (digitShift <= 0) {
            break;
          }
        }
        if (newLength <= 9) {
          isSmall = true;
          shiftedSmall = FastParseLong(str, 0, newLength);
        } else {
          shiftedBigInt = BigInteger.fromSubstring(str, 0, newLength);
        }
        bitsAfterLeftmost = (bitsAfterLeftmost != 0) ? 1 : 0;
      }
    }

    /**
     * Shifts a number to the right, gathering information on whether the
     * last digit discarded is set and whether the discarded digits to the
     * right of that digit are set. Assumes that the big integer being shifted
     * is positive.
     * @param digits A 32-bit signed integer.
     */
    public void ShiftRightInt(int digits) {
      if (isSmall)
        ShiftRightSmall(digits);
      else
        ShiftRightBig(digits);
    }
    private void ShiftRightSmall(int digits) {
      if (digits <= 0) return;
      if (shiftedSmall == 0) {
        if(discardedBitCount==null)
          discardedBitCount=new FastInteger(0);
        discardedBitCount.AddInt(digits);
        bitsAfterLeftmost |= bitLeftmost;
        bitLeftmost = 0;
        knownBitLength = new FastInteger(1);
        return;
      }

      int kb = 0;
      int tmp = shiftedSmall;
      while (tmp > 0) {
        kb++;
        tmp /= 10;
      }
      // Make sure digit length is 1 if value is 0
      if (kb == 0) kb++;
      knownBitLength=new FastInteger(kb);
      if(discardedBitCount==null)
        discardedBitCount=new FastInteger(0);
      discardedBitCount.AddInt(digits);
      while (digits > 0) {
        if (shiftedSmall == 0) {
          bitsAfterLeftmost |= bitLeftmost;
          bitLeftmost = 0;
          knownBitLength = new FastInteger(0);
          break;
        } else {
          int digit = (int)(shiftedSmall % 10);
          bitsAfterLeftmost |= bitLeftmost;
          bitLeftmost = digit;
          digits--;
          shiftedSmall /= 10;
          knownBitLength.Decrement();
        }
      }
      bitsAfterLeftmost = (bitsAfterLeftmost != 0) ? 1 : 0;
    }

    /**
     *
     * @param bits A FastInteger object.
     */
    public void ShiftToDigits(FastInteger bits) {
      if(bits.CanFitInInt32()){
        int intval=bits.AsInt32();
        if(intval<0)
          throw new IllegalArgumentException("bits is negative");
        ShiftToDigitsInt(intval);
      } else {
        if(bits.signum()<0)
          throw new IllegalArgumentException("bits is negative");
        knownBitLength=CalcKnownDigitLength();
        BigInteger bigintDiff=knownBitLength.AsBigInteger();
        BigInteger bitsBig=bits.AsBigInteger();
        bigintDiff=bigintDiff.subtract(bitsBig);
        if(bigintDiff.signum()>0){
          // current length is greater than the
          // desired bit length
          ShiftRight(FastInteger.FromBig(bigintDiff));
        }
      }
    }

    /**
     * Shifts a number until it reaches the given number of digits, gathering
     * information on whether the last digit discarded is set and whether
     * the discarded digits to the right of that digit are set. Assumes that
     * the big integer being shifted is positive.
     * @param digits A 64-bit signed integer.
     */
    public void ShiftToDigitsInt(int digits) {
      if (isSmall)
        ShiftToBitsSmall(digits);
      else
        ShiftToBitsBig(digits);
    }

    private FastInteger CalcKnownDigitLength() {
      if (isSmall) {
        int kb = 0;
        int v2=shiftedSmall;
        if(v2>=1000000000)kb=10;
        else if(v2>=100000000)kb=9;
        else if(v2>=10000000)kb=8;
        else if(v2>=1000000)kb=7;
        else if(v2>=100000)kb=6;
        else if(v2>=10000)kb=5;
        else if(v2>=1000)kb=4;
        else if(v2>=100)kb=3;
        else if(v2>=10)kb=2;
        else kb=1;
        return new FastInteger(kb);
      } else {
        return new FastInteger(shiftedBigInt.getDigitCount());
      }
    }
    private void ShiftToBitsSmall(int digits) {
      int kb=0;
      int v2=shiftedSmall;
      if(v2>=1000000000)kb=10;
      else if(v2>=100000000)kb=9;
      else if(v2>=10000000)kb=8;
      else if(v2>=1000000)kb=7;
      else if(v2>=100000)kb=6;
      else if(v2>=10000)kb=5;
      else if(v2>=1000)kb=4;
      else if(v2>=100)kb=3;
      else if(v2>=10)kb=2;
      else kb=1;
      knownBitLength=new FastInteger(kb);
      if (kb > digits) {
        int digitShift = (int)(kb - digits);
        int newLength = (int)(kb - digitShift);
        knownBitLength = new FastInteger(Math.max(1, newLength));
        if(discardedBitCount==null)
          discardedBitCount=new FastInteger(digitShift);
        else
          discardedBitCount.AddInt(digitShift);
        for (int i = 0; i < digitShift; i++) {
          int digit = (int)(shiftedSmall % 10);
          shiftedSmall /= 10;
          bitsAfterLeftmost |= bitLeftmost;
          bitLeftmost = digit;
        }
        bitsAfterLeftmost = (bitsAfterLeftmost != 0) ? 1 : 0;
      }
    }
  }

