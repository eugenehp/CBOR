package com.upokecenter.util;
/*
Written in 2013 by Peter O.
Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://peteroupc.github.io/CBOR/
 */

    /**
     * Description of DecimalUtility.
     */
  final class DecimalUtility {
private DecimalUtility(){}
    private static BigInteger[] BigIntPowersOfTen = new BigInteger[]{
      BigInteger.ONE, BigInteger.TEN, BigInteger.valueOf(100), BigInteger.valueOf(1000), BigInteger.valueOf(10000), BigInteger.valueOf(100000), BigInteger.valueOf(1000000), BigInteger.valueOf(10000000), BigInteger.valueOf(100000000), BigInteger.valueOf(1000000000),
      BigInteger.valueOf(10000000000L), BigInteger.valueOf(100000000000L), BigInteger.valueOf(1000000000000L), BigInteger.valueOf(10000000000000L),
      BigInteger.valueOf(100000000000000L), BigInteger.valueOf(1000000000000000L), BigInteger.valueOf(10000000000000000L),
      BigInteger.valueOf(100000000000000000L), BigInteger.valueOf(1000000000000000000L)
    };

    private static BigInteger[] BigIntPowersOfFive = new BigInteger[]{
      BigInteger.ONE, BigInteger.valueOf(5), BigInteger.valueOf(25), BigInteger.valueOf(125), BigInteger.valueOf(625), BigInteger.valueOf(3125), BigInteger.valueOf(15625), BigInteger.valueOf(78125), BigInteger.valueOf(390625),
      BigInteger.valueOf(1953125), BigInteger.valueOf(9765625), BigInteger.valueOf(48828125), BigInteger.valueOf(244140625), BigInteger.valueOf(1220703125),
      BigInteger.valueOf(6103515625L), BigInteger.valueOf(30517578125L), BigInteger.valueOf(152587890625L), BigInteger.valueOf(762939453125L),
      BigInteger.valueOf(3814697265625L), BigInteger.valueOf(19073486328125L), BigInteger.valueOf(95367431640625L),
      BigInteger.valueOf(476837158203125L), BigInteger.valueOf(2384185791015625L), BigInteger.valueOf(11920928955078125L),
      BigInteger.valueOf(59604644775390625L), BigInteger.valueOf(298023223876953125L), BigInteger.valueOf(1490116119384765625L),
      BigInteger.valueOf(7450580596923828125L)
    };

    static int ShiftLeftOne(int[] arr){
      {
        int carry=0;
        for(int i=0;i<arr.length;i++){
          int item=arr[i];
          arr[i]=(int)(arr[i]<<1)|(int)carry;
          carry=((item>>31)!=0) ? 1 : 0;
        }
        return carry;
      }
    }

    static int CountTrailingZeros(int numberValue) {
      if (numberValue == 0)
        return 32;
      int i=0;
      {
        if ((numberValue << 16) == 0) {
          numberValue >>= 16;
          i += 16;
        }

        if ((numberValue << 24) == 0) {
          numberValue >>= 8;
          i += 8;
        }

        if ((numberValue << 28) == 0) {
          numberValue >>= 4;
          i += 4;
        }

        if ((numberValue << 30) == 0) {
          numberValue >>= 2;
          i += 2;
        }

        if ((numberValue << 31) == 0)
          ++i;
      }
      return i;
    }

    static int BitPrecisionInt(int numberValue) {
      if (numberValue == 0)
        return 0;
      int i=32;
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

        if ((numberValue >> 31) == 0)
          --i;
      }
      return i;
    }

    static int ShiftAwayTrailingZerosTwoElements(int[] arr){
      int a0=arr[0];
      int a1=arr[1];
      int tz=CountTrailingZeros(a0);
      if(tz==0)return 0;
      {
        if(tz<32){
          int carry=a1<<(32-tz);
          arr[0]=(int)((a0>>tz)&(0x7FFFFFFF>>(tz-1)))|(int)(carry);
          arr[1]=((a1>>tz)&(0x7FFFFFFF>>(tz-1)));
          return tz;
        } else {
          tz=CountTrailingZeros(a1);
          if(tz==32){
            arr[0]=0;
          } else if(tz>0){
            arr[0]=((a1>>tz)&(0x7FFFFFFF>>(tz-1)));
          } else {
            arr[0]=a1;
          }
          arr[1]=0;
          return 32+tz;
        }
      }
    }

    static boolean HasBitSet(int[] arr, int bit){
      return ((bit>>5)<arr.length && (arr[bit>>5]&(1<<(bit&31)))!=0);
    }

    private static final class PowerCache {
      private static final int MaxSize=64;
      private BigInteger[] outputs;
      private BigInteger[] inputs;
      private int[] inputsInts;
      public PowerCache () {
        outputs=new BigInteger[MaxSize];
        inputs=new BigInteger[MaxSize];
        inputsInts=new int[MaxSize];
      }
      int size;
      public BigInteger[] FindCachedPowerOrSmaller(BigInteger bi) {
        BigInteger[] ret=null;
        BigInteger minValue=null;
        synchronized(outputs){
          for(int i=0;i<size;i++){
            if(inputs[i].compareTo(bi)<=0 && (minValue==null || inputs[i].compareTo(minValue)>=0)){
              //System.out.println("Have cached power ({0}, {1})",inputs[i],bi);
              ret=new BigInteger[]{inputs[i],outputs[i]};
              minValue=inputs[i];
            }
          }
        }
        return ret;
      }
    /**
     *
     * @param bi A BigInteger object.
     * @return A BigInteger object.
     */
      public BigInteger GetCachedPower(BigInteger bi) {
        synchronized(outputs){
          for(int i=0;i<size;i++){
            if(bi.equals(inputs[i])){
              if(i!=0){
                BigInteger tmp;
                // Move to head of cache if it isn't already
                tmp=inputs[i];inputs[i]=inputs[0];inputs[0]=tmp;
                int tmpi=inputsInts[i];inputsInts[i]=inputsInts[0];inputsInts[0]=tmpi;
                tmp=outputs[i];outputs[i]=outputs[0];outputs[0]=tmp;
                // Move formerly newest to next newest
                if(i!=1){
                  tmp=inputs[i];inputs[i]=inputs[1];inputs[1]=tmp;
                  tmpi=inputsInts[i];inputsInts[i]=inputsInts[1];inputsInts[1]=tmpi;
                  tmp=outputs[i];outputs[i]=outputs[1];outputs[1]=tmp;
                }
              }
              return outputs[0];
            }
          }
        }
        return null;
      }
    /**
     *
     * @param bi A 32-bit signed integer.
     * @return A BigInteger object.
     */
public BigInteger GetCachedPowerInt(int bi) {
        synchronized(outputs){
          for(int i=0;i<size;i++){
            if(inputsInts[i]>=0 && inputsInts[i]==bi){
              if(i!=0){
                BigInteger tmp;
                // Move to head of cache if it isn't already
                tmp=inputs[i];inputs[i]=inputs[0];inputs[0]=tmp;
                int tmpi=inputsInts[i];inputsInts[i]=inputsInts[0];inputsInts[0]=tmpi;
                tmp=outputs[i];outputs[i]=outputs[0];outputs[0]=tmp;
                // Move formerly newest to next newest
                if(i!=1){
                  tmp=inputs[i];inputs[i]=inputs[1];inputs[1]=tmp;
                  tmpi=inputsInts[i];inputsInts[i]=inputsInts[1];inputsInts[1]=tmpi;
                  tmp=outputs[i];outputs[i]=outputs[1];outputs[1]=tmp;
                }
              }
              return outputs[0];
            }
          }
        }
        return null;
      }
    /**
     *
     * @param input A BigInteger object.
     * @param output A BigInteger object.
     */
      public void AddPower(BigInteger input, BigInteger output) {
        synchronized(outputs){
          if(size<MaxSize){
            // Shift newer entries down
            for(int i=size;i>0;i--){
              inputs[i]=inputs[i-1];
              inputsInts[i]=inputsInts[i-1];
              outputs[i]=outputs[i-1];
            }
            inputs[0]=input;
            inputsInts[0]=(input.canFitInInt()) ? input.intValue() : -1;
            outputs[0]=output;
            size++;
          } else {
            // Shift newer entries down
            for(int i=MaxSize-1;i>0;i--){
              inputs[i]=inputs[i-1];
              inputsInts[i]=inputsInts[i-1];
              outputs[i]=outputs[i-1];
            }
            inputs[0]=input;
            inputsInts[0]=(input.canFitInInt()) ? input.intValue() : -1;
            outputs[0]=output;
          }
        }
      }
    }

    private static PowerCache powerOfFiveCache=new DecimalUtility.PowerCache();
    private static PowerCache powerOfTenCache=new DecimalUtility.PowerCache();

    static BigInteger FindPowerOfFiveFromBig(BigInteger diff) {
      int sign=diff.signum();
      if(sign<0)return BigInteger.ZERO;
      if (sign == 0) return BigInteger.ONE;
      FastInteger intcurexp = FastInteger.FromBig(diff);
      if (intcurexp.CompareToInt(54) <= 0) {
        return FindPowerOfFive(intcurexp.AsInt32());
      }
      BigInteger mantissa = BigInteger.ONE;
      BigInteger bigpow;
      BigInteger origdiff=diff;
      bigpow=powerOfFiveCache.GetCachedPower(origdiff);
      if(bigpow!=null)return bigpow;
      BigInteger[] otherPower=powerOfFiveCache.FindCachedPowerOrSmaller(origdiff);
      if(otherPower!=null){
        intcurexp.SubtractBig(otherPower[0]);
        bigpow=otherPower[1];
        mantissa=bigpow;
      } else {
        bigpow = BigInteger.ZERO;
      }
      while (intcurexp.signum() > 0) {
        if (intcurexp.CompareToInt(27) <= 0) {
          bigpow = FindPowerOfFive(intcurexp.AsInt32());
          mantissa=mantissa.multiply(bigpow);
          break;
        } else if (intcurexp.CompareToInt(9999999) <= 0) {
          bigpow = (FindPowerOfFive(1)).pow(intcurexp.AsInt32());
          mantissa=mantissa.multiply(bigpow);
          break;
        } else {
          if (bigpow.signum()==0)
            bigpow = (FindPowerOfFive(1)).pow(9999999);
          mantissa=mantissa.multiply(bigpow);
          intcurexp.AddInt(-9999999);
        }
      }
      powerOfFiveCache.AddPower(origdiff,mantissa);
      return mantissa;
    }

    private static BigInteger BigInt36 = BigInteger.valueOf(36);

    static BigInteger FindPowerOfTenFromBig(BigInteger bigintExponent) {
      int sign=bigintExponent.signum();
      if(sign<0)return BigInteger.ZERO;
      if (sign == 0) return BigInteger.ONE;
      if (bigintExponent.compareTo(BigInt36) <= 0) {
        return FindPowerOfTen(bigintExponent.intValue());
      }
      FastInteger intcurexp = FastInteger.FromBig(bigintExponent);
      BigInteger mantissa = BigInteger.ONE;
      BigInteger bigpow = BigInteger.ZERO;
      while (intcurexp.signum() > 0) {
        if (intcurexp.CompareToInt(18) <= 0) {
          bigpow = FindPowerOfTen(intcurexp.AsInt32());
          mantissa=mantissa.multiply(bigpow);
          break;
        } else if (intcurexp.CompareToInt(9999999) <= 0) {
          int val = intcurexp.AsInt32();
          bigpow = FindPowerOfFive(val);
          bigpow=bigpow.shiftLeft(val);
          mantissa=mantissa.multiply(bigpow);
          break;
        } else {
          if (bigpow.signum()==0) {
            bigpow = FindPowerOfFive(9999999);
            bigpow=bigpow.shiftLeft(9999999);
          }
          mantissa=mantissa.multiply(bigpow);
          intcurexp.AddInt(-9999999);
        }
      }
      return mantissa;
    }

    private static BigInteger FivePower40=(BigInteger.valueOf(95367431640625L)).multiply(BigInteger.valueOf(95367431640625L));

    static BigInteger FindPowerOfFive(int precision) {
      if(precision<0)return BigInteger.ZERO;
      if (precision == 0) return BigInteger.ONE;
      BigInteger bigpow;
      BigInteger ret;
      if (precision <= 27)
        return BigIntPowersOfFive[(int)precision];
      if(precision==40)
        return FivePower40;
      int startPrecision=precision;
      bigpow=powerOfFiveCache.GetCachedPowerInt(precision);
      if(bigpow!=null)return bigpow;
      BigInteger origPrecision=BigInteger.valueOf(precision);
      if (precision <= 54) {
        if((precision&1)==0){
          ret = BigIntPowersOfFive[(int)(precision>>1)];
          ret=ret.multiply(ret);
          powerOfFiveCache.AddPower(origPrecision,ret);
          return ret;
        } else {
          ret = BigIntPowersOfFive[27];
          bigpow = BigIntPowersOfFive[((int)precision) - 27];
          ret=ret.multiply(bigpow);
          powerOfFiveCache.AddPower(origPrecision,ret);
          return ret;
        }
      }
      if(precision>40 && precision<=94){
        ret = FivePower40;
        bigpow = FindPowerOfFive(precision-40);
        ret=ret.multiply(bigpow);
        powerOfFiveCache.AddPower(origPrecision,ret);
        return ret;
      }
      BigInteger[] otherPower;
      boolean first = true;
      bigpow=BigInteger.ZERO;
      while(true){
        otherPower=powerOfFiveCache.FindCachedPowerOrSmaller(BigInteger.valueOf(precision));
        if(otherPower!=null){
          BigInteger otherPower0=otherPower[0];
          BigInteger otherPower1=otherPower[1];
          precision-=otherPower0.intValue();
          if (first)
            bigpow=otherPower[1];
          else {
            bigpow=bigpow.multiply(otherPower1);
          }
          first=false;
        } else {
          break;
        }
      }
      ret = (!first ? bigpow : BigInteger.ONE );
      while (precision > 0) {
        if (precision <= 27) {
          bigpow = BigIntPowersOfFive[(int)precision];
          if (first)
            ret = bigpow;
          else
            ret=ret.multiply(bigpow);
          first = false;
          break;
        } else if (precision <= 9999999) {
          //          System.out.println("calcing pow for "+precision);
          bigpow = (BigIntPowersOfFive[1]).pow(precision);
          if(precision!=startPrecision){
            BigInteger bigprec=BigInteger.valueOf(precision);
            powerOfFiveCache.AddPower(bigprec,bigpow);
          }
          if (first)
            ret = bigpow;
          else
            ret=ret.multiply(bigpow);
          first = false;
          break;
        } else {
          if (bigpow.signum()==0)
            bigpow = FindPowerOfFive(9999999);
          if (first)
            ret = bigpow;
          else
            ret=ret.multiply(bigpow);
          first = false;
          precision -= 9999999;
        }
      }
      powerOfFiveCache.AddPower(origPrecision,ret);
      return ret;
    }

    static BigInteger FindPowerOfTen(int precision) {
      if(precision<0)return BigInteger.ZERO;
      if (precision == 0) return BigInteger.ONE;
      BigInteger bigpow;
      BigInteger ret;
      if (precision <= 18)
        return BigIntPowersOfTen[(int)precision];
      int startPrecision=precision;
      bigpow=powerOfTenCache.GetCachedPowerInt(precision);
      if(bigpow!=null)return bigpow;
      BigInteger origPrecision=BigInteger.valueOf(precision);
      if (precision <= 27) {
        int prec = (int)precision;
        ret = BigIntPowersOfFive[prec];
        ret=ret.shiftLeft(prec);
        powerOfTenCache.AddPower(origPrecision,ret);
        return ret;
      }
      if (precision <= 36) {
        if((precision&1)==0){
          ret = BigIntPowersOfTen[(int)(precision>>1)];
          ret=ret.multiply(ret);
          powerOfTenCache.AddPower(origPrecision,ret);
          return ret;
        } else {
          ret = BigIntPowersOfTen[18];
          bigpow = BigIntPowersOfTen[((int)precision) - 18];
          ret=ret.multiply(bigpow);
          powerOfTenCache.AddPower(origPrecision,ret);
          return ret;
        }
      }
      BigInteger[] otherPower;
      boolean first = true;
      bigpow=BigInteger.ZERO;
      while(true){
        otherPower=powerOfTenCache.FindCachedPowerOrSmaller(BigInteger.valueOf(precision));
        if(otherPower!=null){
          BigInteger otherPower0=otherPower[0];
          BigInteger otherPower1=otherPower[1];
          precision-=otherPower0.intValue();
          if (first)
            bigpow=otherPower[1];
          else {
            bigpow=bigpow.multiply(otherPower1);
          }
          first=false;
        } else {
          break;
        }
      }
      ret = (!first ? bigpow : BigInteger.ONE );
      while (precision > 0) {
        if (precision <= 18) {
          bigpow = BigIntPowersOfTen[(int)precision];
          if (first)
            ret = bigpow;
          else
            ret=ret.multiply(bigpow);
          first = false;
          break;
        } else if (precision <= 9999999) {
          //          System.out.println("calcing pow for "+precision);
          bigpow = FindPowerOfFive(precision);
          bigpow=bigpow.shiftLeft(precision);
          if(precision!=startPrecision){
            BigInteger bigprec=BigInteger.valueOf(precision);
            powerOfTenCache.AddPower(bigprec,bigpow);
          }
          if (first)
            ret = bigpow;
          else
            ret=ret.multiply(bigpow);
          first = false;
          break;
        } else {
          if (bigpow.signum()==0)
            bigpow = FindPowerOfTen(9999999);
          if (first)
            ret = bigpow;
          else
            ret=ret.multiply(bigpow);
          first = false;
          precision -= 9999999;
        }
      }
      powerOfTenCache.AddPower(origPrecision,ret);
      return ret;
    }
  }

