package com.upokecenter.util;
/*
Written in 2013 by Peter O.
Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://peteroupc.github.io/CBOR/
 */

    /**
     * Represents an arbitrary-precision binary floating-point number.
     * Consists of an integer mantissa and an integer exponent, both arbitrary-precision.
     * The value of the number is equal to mantissa * 2^exponent. This class
     * also supports values for negative zero, not-a-number (NaN) values,
     * and infinity. <p>Passing a signaling NaN to any arithmetic operation
     * shown here will signal the flag FlagInvalid and return a quiet NaN,
     * unless noted otherwise.</p> <p>Passing a quiet NaN to any arithmetic
     * operation shown here will return a quiet NaN, unless noted otherwise.</p>
     * <p>Unless noted otherwise, passing a null ExtendedFloat argument
     * to any method here will throw an exception.</p> <p>When an arithmetic
     * operation signals the flag FlagInvalid, FlagOverflow, or FlagDivideByZero,
     * it will not throw an exception too.</p> <p>An ExtendedFloat value
     * can be serialized in one of the following ways:</p> <ul> <li>By calling
     * the toString() method, which will always return distinct strings
     * for distinct ExtendedFloat values. However, not all strings can
     * be converted back to an ExtendedFloat without loss, especially if
     * the string has a fractional part.</li> <li>By calling the UnsignedMantissa,
     * Exponent, and IsNegative properties, and calling the IsInfinity,
     * IsQuietNaN, and IsSignalingNaN methods. The return values combined
     * will uniquely identify a particular ExtendedFloat value.</li>
     * </ul>
     */
  public final class ExtendedFloat implements Comparable<ExtendedFloat> {
    BigInteger exponent;
    BigInteger unsignedMantissa;
    int flags;

    /**
     * Gets this object's exponent. This object's value will be an integer
     * if the exponent is positive or zero.
     */
    public BigInteger getExponent() { return exponent; }
    /**
     * Gets the absolute value of this object's unscaled value.
     */
    public BigInteger getUnsignedMantissa() { return unsignedMantissa; }

    /**
     * Gets this object's unscaled value.
     */
    public BigInteger getMantissa() { return this.isNegative() ? ((unsignedMantissa).negate()) : unsignedMantissa; }

    /**
     * Determines whether this object's mantissa and exponent are equal
     * to those of another object.
     * @param otherValue An ExtendedFloat object.
     * @return A Boolean object.
     */
    public boolean EqualsInternal(ExtendedFloat otherValue) {
      if (otherValue == null)
        return false;
      return this.exponent.equals(otherValue.exponent) &&
        this.unsignedMantissa.equals(otherValue.unsignedMantissa) &&
        this.flags == otherValue.flags;
    }

    /**
     *
     * @param other An ExtendedFloat object.
     * @return A Boolean object.
     */
    public boolean equals(ExtendedFloat other) {
      return EqualsInternal(other);
    }
    /**
     * Determines whether this object's mantissa and exponent are equal
     * to those of another object and that other object is a decimal fraction.
     * @param obj An arbitrary object.
     * @return True if the objects are equal; false otherwise.
     */
    @Override public boolean equals(Object obj) {
      return EqualsInternal(((obj instanceof ExtendedFloat) ? (ExtendedFloat)obj : null));
    }
    /**
     * Calculates this object's hash code.
     * @return This object&apos;s hash code.
     */
    @Override public int hashCode() {
      int hashCode_ = 0;
      {
        hashCode_ = hashCode_ + 1000000007 * exponent.hashCode();
        hashCode_ = hashCode_ + 1000000009 * unsignedMantissa.hashCode();
        hashCode_ = hashCode_ + 1000000009 * flags;
      }
      return hashCode_;
    }

    /**
     * Creates a number with the value exponent*2^mantissa.
     * @param mantissa The unscaled value.
     * @param exponent The binary exponent.
     * @return An ExtendedFloat object.
     */
    public static ExtendedFloat Create(BigInteger mantissa, BigInteger exponent) {
      if((mantissa)==null)throw new NullPointerException("mantissa");
      if((exponent)==null)throw new NullPointerException("exponent");
      ExtendedFloat ex=new ExtendedFloat();
      ex.exponent = exponent;
      int sign = mantissa==null ? 0 : mantissa.signum();
      ex.unsignedMantissa = sign < 0 ? ((mantissa).negate()) : mantissa;
      ex.flags = (sign < 0) ? BigNumberFlags.FlagNegative : 0;
      return ex;
    }

    private ExtendedFloat() {
    }

    static ExtendedFloat CreateWithFlags(BigInteger mantissa,
                                                  BigInteger exponent, int flags) {
      ExtendedFloat ext = ExtendedFloat.Create(mantissa, exponent);
      ext.flags = flags;
      return ext;
    }

    /**
     * Creates a binary float from a string that represents a number. Note
     * that if the string contains a negative exponent, the resulting value
     * might not be exact. However, the resulting binary float will contain
     * enough precision to accurately convert it to a 32-bit or 64-bit floating
     * point number (float or double).<p> The format of the string generally
     * consists of:<ul> <li> An optional '-' or '+' character (if '-', the
     * value is negative.)</li> <li> One or more digits, with a single optional
     * decimal point after the first digit and before the last digit.</li>
     * <li> Optionally, E+ (positive exponent) or E- (negative exponent)
     * plus one or more digits specifying the exponent.</li> </ul> </p>
     * <p>The string can also be "-INF", "-Infinity", "Infinity", "Inf",
     * quiet NaN ("qNaN") followed by any number of digits, or signaling
     * NaN ("sNaN") followed by any number of digits, all in any combination
     * of upper and lower case.</p> <p> The format generally follows the
     * definition in java.math.BigDecimal(), except that the digits must
     * be ASCII digits ('0' through '9').</p>
     * @param str A string that represents a number.
     * @param ctx A PrecisionContext object.
     * @return An ExtendedFloat object.
     */
    public static ExtendedFloat FromString(String str, PrecisionContext ctx) {
      if (str == null)
        throw new NullPointerException("str");
      return ExtendedDecimal.FromString(str,ctx).ToExtendedFloat();
    }

    public static ExtendedFloat FromString(String str) {
      return FromString(str,null);
    }

    private static BigInteger BigShiftIteration = BigInteger.valueOf(1000000);
    private static int ShiftIteration = 1000000;
    private static BigInteger ShiftLeft(BigInteger val, BigInteger bigShift) {
      while (bigShift.compareTo(BigShiftIteration) > 0) {
        val=val.shiftLeft(1000000);
        bigShift=bigShift.subtract(BigShiftIteration);
      }
      int lastshift = bigShift.intValue();
      val=val.shiftLeft(lastshift);
      return val;
    }
    private static BigInteger ShiftLeftInt(BigInteger val, int shift) {
      while (shift > ShiftIteration) {
        val=val.shiftLeft(1000000);
        shift -= ShiftIteration;
      }
      int lastshift = (int)shift;
      val=val.shiftLeft(lastshift);
      return val;
    }

    private static final class BinaryMathHelper implements IRadixMathHelper<ExtendedFloat> {

    /**
     *
     * @return A 32-bit signed integer.
     */
      public int GetRadix() {
        return 2;
      }

    /**
     *
     * @param value An ExtendedFloat object.
     * @return A 32-bit signed integer.
     */
      public int GetSign(ExtendedFloat value) {
        return value.signum();
      }

    /**
     *
     * @param value An ExtendedFloat object.
     * @return A BigInteger object.
     */
      public BigInteger GetMantissa(ExtendedFloat value) {
        return value.unsignedMantissa;
      }

    /**
     *
     * @param value An ExtendedFloat object.
     * @return A BigInteger object.
     */
      public BigInteger GetExponent(ExtendedFloat value) {
        return value.exponent;
      }

    /**
     *
     * @param mantissa A BigInteger object.
     * @param e1 A BigInteger object.
     * @param e2 A BigInteger object.
     * @return A BigInteger object.
     */
      public BigInteger RescaleByExponentDiff(BigInteger mantissa, BigInteger e1, BigInteger e2) {
        boolean negative = (mantissa.signum() < 0);
        if (negative) mantissa=mantissa.negate();
        BigInteger diff = (e1.subtract(e2)).abs();
        mantissa = ShiftLeft(mantissa, diff);
        if (negative) mantissa=mantissa.negate();
        return mantissa;
      }

    /**
     *
     * @param lastDigit A 32-bit signed integer.
     * @param olderDigits A 32-bit signed integer.
     * @param bigint A BigInteger object.
     * @return An IShiftAccumulator object.
     */
      public IShiftAccumulator CreateShiftAccumulatorWithDigits(BigInteger bigint, int lastDigit, int olderDigits) {
        return new BitShiftAccumulator(bigint, lastDigit, olderDigits);
      }

    /**
     *
     * @param bigint A BigInteger object.
     * @return An IShiftAccumulator object.
     */
      public IShiftAccumulator CreateShiftAccumulator(BigInteger bigint) {
        return new BitShiftAccumulator(bigint, 0, 0);
      }

    /**
     *
     * @param num A BigInteger object.
     * @param den A BigInteger object.
     * @return A Boolean object.
     */
      public boolean HasTerminatingRadixExpansion(BigInteger num, BigInteger den) {
        BigInteger gcd = num.gcd(den);
        if (gcd.signum()==0) return false;
        den=den.divide(gcd);
        while (den.testBit(0)==false) {
          den=den.shiftRight(1);
        }
        return den.equals(BigInteger.ONE);
      }

    /**
     *
     * @param bigint A BigInteger object.
     * @param power A FastInteger object.
     * @return A BigInteger object.
     */
      public BigInteger MultiplyByRadixPower(BigInteger bigint, FastInteger power) {
        if (power.signum() <= 0) return bigint;
        if (power.CanFitInInt32()) {
          return ShiftLeftInt(bigint, power.AsInt32());
        } else {
          return ShiftLeft(bigint, power.AsBigInteger());
        }
      }

    /**
     *
     * @param value An ExtendedFloat object.
     * @return A 32-bit signed integer.
     */
      public int GetFlags(ExtendedFloat value) {
        return value.unsignedMantissa.signum() < 0 ? BigNumberFlags.FlagNegative : 0;
      }

    /**
     *
     * @param mantissa A BigInteger object.
     * @param exponent A BigInteger object.
     * @param flags A 32-bit signed integer.
     * @return An ExtendedFloat object.
     */
      public ExtendedFloat CreateNewWithFlags(BigInteger mantissa, BigInteger exponent, int flags) {
        boolean neg = (flags & BigNumberFlags.FlagNegative) != 0;
        if ((neg && mantissa.signum() > 0) || (!neg && mantissa.signum() < 0))
          mantissa=mantissa.negate();
        return ExtendedFloat.Create(mantissa, exponent);
      }
    /**
     *
     * @return A 32-bit signed integer.
     */
      public int GetArithmeticSupport() {
        return BigNumberFlags.FiniteOnly;
      }

    /**
     *
     * @param val A 32-bit signed integer.
     * @return An ExtendedFloat object.
     */
      public ExtendedFloat ValueOf(int val) {
        return FromInt64(val);
      }
    }

    /**
     * Converts this value to an arbitrary-precision integer. Any fractional
     * part in this value will be discarded when converting to a big integer.
     * @return A BigInteger object.
     */
    public BigInteger ToBigInteger() {
      int expsign = this.getExponent().signum();
      if (expsign == 0) {
        // Integer
        return this.getMantissa();
      } else if (expsign > 0) {
        // Integer with trailing zeros
        BigInteger curexp = this.getExponent();
        BigInteger bigmantissa = this.getMantissa();
        if (bigmantissa.signum()==0)
          return bigmantissa;
        boolean neg = (bigmantissa.signum() < 0);
        if (neg) bigmantissa=bigmantissa.negate();
        while (curexp.signum() > 0 && bigmantissa.signum()!=0) {
          int shift = 4096;
          if (curexp.compareTo(BigInteger.valueOf(shift)) < 0) {
            shift = curexp.intValue();
          }
          bigmantissa=bigmantissa.shiftLeft(shift);
          curexp=curexp.subtract(BigInteger.valueOf(shift));
        }
        if (neg) bigmantissa=bigmantissa.negate();
        return bigmantissa;
      } else {
        // Has fractional parts,
        // shift right without rounding
        BigInteger curexp = this.getExponent();
        BigInteger bigmantissa = this.getMantissa();
        if (bigmantissa.signum()==0)
          return bigmantissa;
        boolean neg = (bigmantissa.signum() < 0);
        if (neg) bigmantissa=bigmantissa.negate();
        while (curexp.signum() < 0 && bigmantissa.signum()!=0) {
          int shift = 4096;
          if (curexp.compareTo(BigInteger.valueOf(-4096)) > 0) {
            shift = -(curexp.intValue());
          }
          bigmantissa=bigmantissa.shiftRight(shift);
          curexp=curexp.add(BigInteger.valueOf(shift));
        }
        if (neg) bigmantissa=bigmantissa.negate();
        return bigmantissa;
      }
    }

    private static BigInteger OneShift23 = BigInteger.ONE.shiftLeft(23);
    private static BigInteger OneShift52 = BigInteger.ONE.shiftLeft(52);

    /**
     * Converts this value to a 32-bit floating-point number. The half-even
     * rounding mode is used. <p>If this value is a NaN, sets the high bit of
     * the 32-bit floating point number's mantissa for a quiet NaN, and clears
     * it for a signaling NaN. Then the next highest bit of the mantissa is
     * cleared for a quiet NaN, and set for a signaling NaN. Then the other
     * bits of the mantissa are set to the lowest bits of this object's unsigned
     * mantissa. </p>
     * @return The closest 32-bit floating-point number to this value.
     * The return value can be positive infinity or negative infinity if
     * this value exceeds the range of a 32-bit floating point number.
     */
    public float ToSingle() {
      if (IsPositiveInfinity())
        return Float.POSITIVE_INFINITY;
      if (IsNegativeInfinity())
        return Float.NEGATIVE_INFINITY;
      if (IsNaN()) {
        int nan = 0x7F800001;
        if (this.isNegative()) nan |= ((int)(1 << 31));
        if (IsQuietNaN())
          nan |= 0x400000; // the quiet bit for X86 at least
        else {
          // not really the signaling bit, but done to keep
          // the mantissa from being zero
          nan |= 0x200000;
        }
        if (!(this.getUnsignedMantissa().signum()==0)) {
          // Transfer diagnostic information
          BigInteger bigdata = (this.getUnsignedMantissa().remainder(BigInteger.valueOf(0x200000)));
          nan |= bigdata.intValue();
        }
        return Float.intBitsToFloat(nan);
      }
      if (this.isNegative() && this.signum()==0) {
        return Float.intBitsToFloat(((int)1 << 31));
      }
      BigInteger bigmant = (this.unsignedMantissa).abs();
      FastInteger bigexponent = FastInteger.FromBig(this.exponent);
      int bitLeftmost = 0;
      int bitsAfterLeftmost = 0;
      if (this.unsignedMantissa.signum()==0) {
        return 0.0f;
      }
      int smallmant = 0;
      FastInteger fastSmallMant;
      if (bigmant.compareTo(OneShift23) < 0) {
        smallmant = bigmant.intValue();
        int exponentchange = 0;
        while (smallmant < (1 << 23)) {
          smallmant <<= 1;
          exponentchange++;
        }
        bigexponent.SubtractInt(exponentchange);
        fastSmallMant = new FastInteger(smallmant);
      } else {
        BitShiftAccumulator accum = new BitShiftAccumulator(bigmant, 0, 0);
        accum.ShiftToDigitsInt(24);
        bitsAfterLeftmost = accum.getOlderDiscardedDigits();
        bitLeftmost = accum.getLastDiscardedDigit();
        bigexponent.Add(accum.getDiscardedDigitCount());
        fastSmallMant = accum.getShiftedIntFast();
      }
      // Round half-even
      if (bitLeftmost > 0 && (bitsAfterLeftmost > 0 ||
                              !fastSmallMant.isEvenNumber())) {
        fastSmallMant.Increment();
        if (fastSmallMant.CompareToInt(1 << 24) == 0) {
          fastSmallMant = new FastInteger(1 << 23);
          bigexponent.Increment();
        }
      }
      boolean subnormal = false;
      if (bigexponent.CompareToInt(104) > 0) {
        // exponent too big
        return (this.isNegative()) ?
          Float.NEGATIVE_INFINITY :
          Float.POSITIVE_INFINITY;
      } else if (bigexponent.CompareToInt(-149) < 0) {
        // subnormal
        subnormal = true;
        // Shift while number remains subnormal
        BitShiftAccumulator accum = BitShiftAccumulator.FromInt32(fastSmallMant.AsInt32());
        FastInteger fi = FastInteger.Copy(bigexponent).SubtractInt(-149).Abs();
        accum.ShiftRight(fi);
        bitsAfterLeftmost = accum.getOlderDiscardedDigits();
        bitLeftmost = accum.getLastDiscardedDigit();
        bigexponent.Add(accum.getDiscardedDigitCount());
        fastSmallMant = accum.getShiftedIntFast();
        // Round half-even
        if (bitLeftmost > 0 && (bitsAfterLeftmost > 0 ||
                                !fastSmallMant.isEvenNumber())) {
          fastSmallMant.Increment();
          if (fastSmallMant.CompareToInt(1 << 24) == 0) {
            fastSmallMant = new FastInteger(1 << 23);
            bigexponent.Increment();
          }
        }
      }
      if (bigexponent.CompareToInt(-149) < 0) {
        // exponent too small, so return zero
        return (this.isNegative()) ?
          Float.intBitsToFloat(1 << 31) :
          Float.intBitsToFloat(0);
      } else {
        int smallexponent = bigexponent.AsInt32();
        smallexponent = smallexponent + 150;
        int smallmantissa = ((int)fastSmallMant.AsInt32()) & 0x7FFFFF;
        if (!subnormal) {
          smallmantissa |= (smallexponent << 23);
        }
        if (this.isNegative()) smallmantissa |= (1 << 31);
        return Float.intBitsToFloat(smallmantissa);
      }
    }
    /**
     * Converts this value to a 64-bit floating-point number. The half-even
     * rounding mode is used. <p>If this value is a NaN, sets the high bit of
     * the 64-bit floating point number's mantissa for a quiet NaN, and clears
     * it for a signaling NaN. Then the next highest bit of the mantissa is
     * cleared for a quiet NaN, and set for a signaling NaN. Then the other
     * bits of the mantissa are set to the lowest bits of this object's unsigned
     * mantissa. </p>
     * @return The closest 64-bit floating-point number to this value.
     * The return value can be positive infinity or negative infinity if
     * this value exceeds the range of a 64-bit floating point number.
     */
    public double ToDouble() {
      if (IsPositiveInfinity())
        return Double.POSITIVE_INFINITY;
      if (IsNegativeInfinity())
        return Double.NEGATIVE_INFINITY;
      if (IsNaN()) {
        int[] nan = new int[] { 1, 0x7FF00000 };
        if (this.isNegative()) nan[1] |= ((int)(1 << 31));
        if (IsQuietNaN())
          nan[1] |= 0x80000; // the quiet bit for X86 at least
        else {
          // not really the signaling bit, but done to keep
          // the mantissa from being zero
          nan[1] |= 0x40000;
        }
        if (!(this.getUnsignedMantissa().signum()==0)) {
          // Copy diagnostic information
          int[] words = FastInteger.GetLastWords(this.getUnsignedMantissa(), 2);
          nan[0] = words[0];
          nan[1] = (words[1] & 0x3FFFF);
        }
        return Extras.IntegersToDouble(nan);
      }
      if (this.isNegative() && this.signum()==0) {
        return Extras.IntegersToDouble(new int[] { ((int)(1 << 31)), 0 });
      }
      BigInteger bigmant = (this.unsignedMantissa).abs();
      FastInteger bigexponent = FastInteger.FromBig(this.exponent);
      int bitLeftmost = 0;
      int bitsAfterLeftmost = 0;
      if (this.unsignedMantissa.signum()==0) {
        return 0.0d;
      }
      int[] mantissaBits;
      if (bigmant.compareTo(OneShift52) < 0) {
        mantissaBits = FastInteger.GetLastWords(bigmant, 2);
        // This will be an infinite loop if both elements
        // of the bits array are 0, but the check for
        // 0 was already done above
        while (!DecimalUtility.HasBitSet(mantissaBits, 52)) {
          DecimalUtility.ShiftLeftOne(mantissaBits);
          bigexponent.Decrement();
        }
      } else {
        BitShiftAccumulator accum = new BitShiftAccumulator(bigmant, 0, 0);
        accum.ShiftToDigitsInt(53);
        bitsAfterLeftmost = accum.getOlderDiscardedDigits();
        bitLeftmost = accum.getLastDiscardedDigit();
        bigexponent.Add(accum.getDiscardedDigitCount());
        mantissaBits = FastInteger.GetLastWords(accum.getShiftedInt(), 2);
      }
      // Round half-even
      if (bitLeftmost > 0 && (bitsAfterLeftmost > 0 ||
                              DecimalUtility.HasBitSet(mantissaBits, 0))) {
        // Add 1 to the bits
        mantissaBits[0] = ((int)(mantissaBits[0] + 1));
        if (mantissaBits[0] == 0)
          mantissaBits[1] = ((int)(mantissaBits[1] + 1));
        if (mantissaBits[0] == 0 &&
            mantissaBits[1] == (1 << 21)) { // if mantissa is now 2^53
          mantissaBits[1] >>= 1; // change it to 2^52
          bigexponent.Increment();
        }
      }
      boolean subnormal = false;
      if (bigexponent.CompareToInt(971) > 0) {
        // exponent too big
        return (this.isNegative()) ?
          Double.NEGATIVE_INFINITY :
          Double.POSITIVE_INFINITY;
      } else if (bigexponent.CompareToInt(-1074) < 0) {
        // subnormal
        subnormal = true;
        // Shift while number remains subnormal
        BitShiftAccumulator accum = new BitShiftAccumulator(
          FastInteger.WordsToBigInteger(mantissaBits), 0, 0);
        FastInteger fi = FastInteger.Copy(bigexponent).SubtractInt(-1074).Abs();
        accum.ShiftRight(fi);
        bitsAfterLeftmost = accum.getOlderDiscardedDigits();
        bitLeftmost = accum.getLastDiscardedDigit();
        bigexponent.Add(accum.getDiscardedDigitCount());
        mantissaBits = FastInteger.GetLastWords(accum.getShiftedInt(), 2);
        // Round half-even
        if (bitLeftmost > 0 && (bitsAfterLeftmost > 0 ||
                                DecimalUtility.HasBitSet(mantissaBits, 0))) {
          // Add 1 to the bits
          mantissaBits[0] = ((int)(mantissaBits[0] + 1));
          if (mantissaBits[0] == 0)
            mantissaBits[1] = ((int)(mantissaBits[1] + 1));
          if (mantissaBits[0] == 0 &&
              mantissaBits[1] == (1 << 21)) { // if mantissa is now 2^53
            mantissaBits[1] >>= 1; // change it to 2^52
            bigexponent.Increment();
          }
        }
      }
      if (bigexponent.CompareToInt(-1074) < 0) {
        // exponent too small, so return zero
        return (this.isNegative()) ?
          Extras.IntegersToDouble(new int[] { 0, ((int)0x80000000) }) :
          0.0d;
      } else {
        bigexponent.AddInt(1075);
        // Clear the high bits where the exponent and sign are
        mantissaBits[1] &= 0xFFFFF;
        if (!subnormal) {
          int smallexponent = bigexponent.AsInt32() << 20;
          mantissaBits[1] |= smallexponent;
        }
        if (this.isNegative()) {
          mantissaBits[1] |= ((int)(1 << 31));
        }
        return Extras.IntegersToDouble(mantissaBits);
      }
    }
    /**
     * Creates a binary float from a 32-bit floating-point number. This
     * method computes the exact value of the floating point number, not
     * an approximation, as is often the case by converting the number to
     * a string.
     * @param flt A 32-bit floating-point number.
     * @return A binary float with the same value as &quot;flt&quot;.
     */
    public static ExtendedFloat FromSingle(float flt) {
      int value = Float.floatToRawIntBits(flt);
      boolean neg = ((value >> 31) != 0);
      int fpExponent = (int)((value >> 23) & 0xFF);
      int fpMantissa = value & 0x7FFFFF;
      BigInteger bigmant;
      if (fpExponent == 255) {
        if (fpMantissa == 0) {
          return neg ? NegativeInfinity : PositiveInfinity;
        }
        // Treat high bit of mantissa as quiet/signaling bit
        boolean quiet = (fpMantissa & 0x400000) != 0;
        fpMantissa &= 0x1FFFFF;
        bigmant = BigInteger.valueOf(fpMantissa);
        bigmant=bigmant.subtract(BigInteger.ONE);
        if (bigmant.signum()==0) {
          return quiet ? NaN : SignalingNaN;
        } else {
          return CreateWithFlags(bigmant, BigInteger.ZERO,
                                 (neg ? BigNumberFlags.FlagNegative : 0) |
                                 (quiet ? BigNumberFlags.FlagQuietNaN :
                                  BigNumberFlags.FlagSignalingNaN));
        }
      }
      if (fpExponent == 0) fpExponent++;
      else fpMantissa |= (1 << 23);
      if (fpMantissa == 0) {
        return neg ? ExtendedFloat.NegativeZero : ExtendedFloat.Zero;
      }
      while ((fpMantissa & 1) == 0) {
        fpExponent++;
        fpMantissa >>= 1;
      }
      if (neg) fpMantissa = -fpMantissa;
      bigmant = BigInteger.valueOf(fpMantissa);
      return ExtendedFloat.Create(bigmant,
                               BigInteger.valueOf(fpExponent - 150));
    }

    public static ExtendedFloat FromBigInteger(BigInteger bigint) {
      return ExtendedFloat.Create(bigint, BigInteger.ZERO);
    }

    public static ExtendedFloat FromInt64(long valueSmall) {
      BigInteger bigint = BigInteger.valueOf(valueSmall);
      return ExtendedFloat.Create(bigint, BigInteger.ZERO);
    }

    /**
     * Creates a binary float from a 64-bit floating-point number. This
     * method computes the exact value of the floating point number, not
     * an approximation, as is often the case by converting the number to
     * a string.
     * @param dbl A 64-bit floating-point number.
     * @return A binary float with the same value as &quot;dbl&quot;
     */
    public static ExtendedFloat FromDouble(double dbl) {
      int[] value = Extras.DoubleToIntegers(dbl);
      int fpExponent = (int)((value[1] >> 20) & 0x7ff);
      boolean neg = (value[1] >> 31) != 0;
      if (fpExponent == 2047) {
        if ((value[1] & 0xFFFFF) == 0 && value[0] == 0) {
          return neg ? NegativeInfinity : PositiveInfinity;
        }
        // Treat high bit of mantissa as quiet/signaling bit
        boolean quiet = (value[1] & 0x80000) != 0;
        value[1] &= 0x3FFFF;
        BigInteger info = FastInteger.WordsToBigInteger(value);
        info=info.subtract(BigInteger.ONE);
        if (info.signum()==0) {
          return quiet ? NaN : SignalingNaN;
        } else {
          return CreateWithFlags(info, BigInteger.ZERO,
                                 (neg ? BigNumberFlags.FlagNegative : 0) |
                                 (quiet ? BigNumberFlags.FlagQuietNaN :
                                  BigNumberFlags.FlagSignalingNaN));
        }
      }
      value[1] &= 0xFFFFF; // Mask out the exponent and sign
      if (fpExponent == 0) fpExponent++;
      else value[1] |= 0x100000;
      if ((value[1] | value[0]) != 0) {
        fpExponent += DecimalUtility.ShiftAwayTrailingZerosTwoElements(value);
      } else {
        return neg ? ExtendedFloat.NegativeZero : ExtendedFloat.Zero;
      }
      return CreateWithFlags(
        FastInteger.WordsToBigInteger(value),
        BigInteger.valueOf(fpExponent - 1075),
        (neg ? BigNumberFlags.FlagNegative : 0));
    }

    /**
     *
     * @return An ExtendedDecimal object.
     */
    public ExtendedDecimal ToExtendedDecimal() {
      return ExtendedDecimal.FromExtendedFloat(this);
    }

    /**
     * Converts this value to a string.
     * @return A string representation of this object.
     */
    @Override public String toString() {
      return ExtendedDecimal.FromExtendedFloat(this).toString();
    }
    /**
     * Same as toString(), except that when an exponent is used it will be
     * a multiple of 3. The format of the return value follows the format of
     * the java.math.BigDecimal.toEngineeringString() method.
     * @return A string object.
     */
    public String ToEngineeringString() {
      return ToExtendedDecimal().ToEngineeringString();
    }
    /**
     * Converts this value to a string, but without an exponent part. The
     * format of the return value follows the format of the java.math.BigDecimal.toPlainString()
     * method.
     * @return A string object.
     */
    public String ToPlainString() {
      return ToExtendedDecimal().ToPlainString();
    }

    /**
     * Represents the number 1.
     */

    public static final ExtendedFloat One = ExtendedFloat.Create(BigInteger.ONE, BigInteger.ZERO);

    /**
     * Represents the number 0.
     */

    public static final ExtendedFloat Zero = ExtendedFloat.Create(BigInteger.ZERO, BigInteger.ZERO);

    public static final ExtendedFloat NegativeZero = CreateWithFlags(
      BigInteger.ZERO, BigInteger.ZERO, BigNumberFlags.FlagNegative);
    /**
     * Represents the number 10.
     */

    public static final ExtendedFloat Ten = ExtendedFloat.Create(BigInteger.TEN, BigInteger.ZERO);

    //----------------------------------------------------------------

    /**
     * A not-a-number value.
     */
    public static final ExtendedFloat NaN = CreateWithFlags(
      BigInteger.ZERO,
      BigInteger.ZERO, BigNumberFlags.FlagQuietNaN);
    /**
     * A not-a-number value that signals an invalid operation flag when
     * it's passed as an argument to any arithmetic operation in ExtendedFloat.
     */
    public static final ExtendedFloat SignalingNaN = CreateWithFlags(
      BigInteger.ZERO,
      BigInteger.ZERO, BigNumberFlags.FlagSignalingNaN);
    /**
     * Positive infinity, greater than any other number.
     */
    public static final ExtendedFloat PositiveInfinity = CreateWithFlags(
      BigInteger.ZERO,
      BigInteger.ZERO, BigNumberFlags.FlagInfinity);
    /**
     * Negative infinity, less than any other number.
     */
    public static final ExtendedFloat NegativeInfinity = CreateWithFlags(
      BigInteger.ZERO,
      BigInteger.ZERO, BigNumberFlags.FlagInfinity | BigNumberFlags.FlagNegative);

    /**
     *
     * @return A Boolean object.
     */
    public boolean IsPositiveInfinity() {
      return (this.flags & (BigNumberFlags.FlagInfinity | BigNumberFlags.FlagNegative)) ==
        (BigNumberFlags.FlagInfinity | BigNumberFlags.FlagNegative);
    }

    /**
     *
     * @return A Boolean object.
     */
    public boolean IsNegativeInfinity() {
      return (this.flags & (BigNumberFlags.FlagInfinity | BigNumberFlags.FlagNegative)) ==
        (BigNumberFlags.FlagInfinity);
    }

    /**
     *
     * @return A Boolean object.
     */
    public boolean IsNaN() {
      return (this.flags & (BigNumberFlags.FlagQuietNaN | BigNumberFlags.FlagSignalingNaN)) != 0;
    }

    /**
     * Gets whether this object is positive or negative infinity.
     * @return A Boolean object.
     */
    public boolean IsInfinity() {
      return (this.flags & (BigNumberFlags.FlagInfinity)) != 0;
    }

    /**
     * Gets whether this object is negative, including negative zero.
     */
    public boolean isNegative() {
        return (this.flags & (BigNumberFlags.FlagNegative)) != 0;
      }

    /**
     * Gets whether this object is a quiet not-a-number value.
     * @return A Boolean object.
     */
    public boolean IsQuietNaN() {
      return (this.flags & (BigNumberFlags.FlagQuietNaN)) != 0;
    }

    /**
     * Gets whether this object is a signaling not-a-number value.
     * @return A Boolean object.
     */
    public boolean IsSignalingNaN() {
      return (this.flags & (BigNumberFlags.FlagSignalingNaN)) != 0;
    }

    /**
     * Gets this value's sign: -1 if negative; 1 if positive; 0 if zero.
     */
    public int signum() {
        return (((this.flags & BigNumberFlags.FlagSpecial) == 0) &&
                unsignedMantissa.signum()==0) ? 0 :
          (((this.flags & BigNumberFlags.FlagNegative) != 0) ? -1 : 1);
      }
    /**
     * Gets whether this object's value equals 0.
     */
    public boolean isZero() {
        return ((this.flags & BigNumberFlags.FlagSpecial) == 0) && unsignedMantissa.signum()==0;
      }
    /**
     * Gets the absolute value of this object.
     * @return An ExtendedFloat object.
     */
    public ExtendedFloat Abs() {
      return Abs(null);
    }

    /**
     * Gets an object with the same value as this one, but with the sign reversed.
     * @return An ExtendedFloat object.
     */
    public ExtendedFloat Negate() {
      return Negate(null);
    }

    /**
     * Divides this object by another binary float and returns the result.
     * When possible, the result will be exact.
     * @param divisor The divisor.
     * @return The quotient of the two numbers. Signals FlagDivideByZero
     * and returns infinity if the divisor is 0 and the dividend is nonzero.
     * Signals FlagInvalid and returns NaN if the divisor and the dividend
     * are 0.
     * @throws ArithmeticException The result can't be exact because it
     * would have a nonterminating binary expansion.
     */
    public ExtendedFloat Divide(ExtendedFloat divisor) {
      return Divide(divisor, PrecisionContext.ForRounding(Rounding.Unnecessary));
    }

    /**
     * Divides this object by another binary float and returns a result with
     * the same exponent as this object (the dividend).
     * @param divisor The divisor.
     * @param rounding The rounding mode to use if the result must be scaled
     * down to have the same exponent as this value.
     * @return The quotient of the two numbers. Signals FlagDivideByZero
     * and returns infinity if the divisor is 0 and the dividend is nonzero.
     * Signals FlagInvalid and returns NaN if the divisor and the dividend
     * are 0.
     * @throws ArithmeticException The rounding mode is Rounding.Unnecessary
     * and the result is not exact.
     */
    public ExtendedFloat DivideToSameExponent(ExtendedFloat divisor, Rounding rounding) {
      return DivideToExponent(divisor, this.exponent, PrecisionContext.ForRounding(rounding));
    }

    /**
     * Divides two ExtendedFloat objects, and returns the integer part
     * of the result, rounded down, with the preferred exponent set to this
     * value's exponent minus the divisor's exponent.
     * @param divisor The divisor.
     * @return The integer part of the quotient of the two objects. Signals
     * FlagDivideByZero and returns infinity if the divisor is 0 and the
     * dividend is nonzero. Signals FlagInvalid and returns NaN if the divisor
     * and the dividend are 0.
     */
    public ExtendedFloat DivideToIntegerNaturalScale(
      ExtendedFloat divisor
     ) {
      return DivideToIntegerNaturalScale(divisor, PrecisionContext.ForRounding(Rounding.Down));
    }

    /**
     * Removes trailing zeros from this object's mantissa. For example,
     * 1.000 becomes 1.
     * @param ctx A precision context to control precision, rounding, and
     * exponent range of the result. If HasFlags of the context is true, will
     * also store the flags resulting from the operation (the flags are in
     * addition to the pre-existing flags). Can be null.
     * @return This value with trailing zeros removed. Note that if the result
     * has a very high exponent and the context says to clamp high exponents,
     * there may still be some trailing zeros in the mantissa.
     */
    public ExtendedFloat Reduce(
      PrecisionContext ctx) {
      return math.Reduce(this, ctx);
    }
    /**
     *
     * @param divisor An ExtendedFloat object.
     * @return An ExtendedFloat object.
     */
    public ExtendedFloat RemainderNaturalScale(
      ExtendedFloat divisor
     ) {
      return RemainderNaturalScale(divisor, null);
    }

    /**
     *
     * @param divisor An ExtendedFloat object.
     * @param ctx A PrecisionContext object.
     * @return An ExtendedFloat object.
     */
    public ExtendedFloat RemainderNaturalScale(
      ExtendedFloat divisor,
      PrecisionContext ctx
     ) {
      return Subtract(this.DivideToIntegerNaturalScale(divisor, null)
                      .Multiply(divisor, null), ctx);
    }

    /**
     * Divides two ExtendedFloat objects, and gives a particular exponent
     * to the result.
     * @param divisor An ExtendedFloat object.
     * @param desiredExponentSmall The desired exponent. A negative number
     * places the cutoff point to the right of the usual decimal point. A positive
     * number places the cutoff point to the left of the usual decimal point.
     * @param ctx A precision context object to control the rounding mode
     * to use if the result must be scaled down to have the same exponent as
     * this value. The precision setting of this context is ignored. If HasFlags
     * of the context is true, will also store the flags resulting from the
     * operation (the flags are in addition to the pre-existing flags).
     * Can be null, in which case the default rounding mode is HalfEven.
     * @return The quotient of the two objects. Signals FlagDivideByZero
     * and returns infinity if the divisor is 0 and the dividend is nonzero.
     * Signals FlagInvalid and returns NaN if the divisor and the dividend
     * are 0. Signals FlagInvalid and returns NaN if the context defines
     * an exponent range and the desired exponent is outside that range.
     * @throws ArithmeticException The rounding mode is Rounding.Unnecessary
     * and the result is not exact.
     */
    public ExtendedFloat DivideToExponent(
      ExtendedFloat divisor,
      long desiredExponentSmall,
      PrecisionContext ctx
     ) {
      return DivideToExponent(divisor, (BigInteger.valueOf(desiredExponentSmall)), ctx);
    }

    /**
     * Divides this ExtendedFloat object by another ExtendedFloat object.
     * The preferred exponent for the result is this object's exponent minus
     * the divisor's exponent.
     * @param divisor The divisor.
     * @param ctx A precision context to control precision, rounding, and
     * exponent range of the result. If HasFlags of the context is true, will
     * also store the flags resulting from the operation (the flags are in
     * addition to the pre-existing flags). Can be null.
     * @return The quotient of the two objects. Signals FlagDivideByZero
     * and returns infinity if the divisor is 0 and the dividend is nonzero.
     * Signals FlagInvalid and returns NaN if the divisor and the dividend
     * are 0.
     * @throws ArithmeticException Either ctx is null or ctx's precision
     * is 0, and the result would have a nonterminating binary expansion;
     * or, the rounding mode is Rounding.Unnecessary and the result is not
     * exact.
     */
    public ExtendedFloat Divide(
      ExtendedFloat divisor,
      PrecisionContext ctx
     ) {
      return math.Divide(this, divisor, ctx);
    }

    /**
     * Divides two ExtendedFloat objects, and gives a particular exponent
     * to the result.
     * @param divisor An ExtendedFloat object.
     * @param desiredExponentSmall The desired exponent. A negative number
     * places the cutoff point to the right of the usual decimal point. A positive
     * number places the cutoff point to the left of the usual decimal point.
     * @param rounding The rounding mode to use if the result must be scaled
     * down to have the same exponent as this value.
     * @return The quotient of the two objects. Signals FlagDivideByZero
     * and returns infinity if the divisor is 0 and the dividend is nonzero.
     * Signals FlagInvalid and returns NaN if the divisor and the dividend
     * are 0.
     * @throws ArithmeticException The rounding mode is Rounding.Unnecessary
     * and the result is not exact.
     */
    public ExtendedFloat DivideToExponent(
      ExtendedFloat divisor,
      long desiredExponentSmall,
      Rounding rounding
     ) {
      return DivideToExponent(divisor, (BigInteger.valueOf(desiredExponentSmall)), PrecisionContext.ForRounding(rounding));
    }

    /**
     * Divides two ExtendedFloat objects, and gives a particular exponent
     * to the result.
     * @param divisor An ExtendedFloat object.
     * @param exponent The desired exponent. A negative number places the
     * cutoff point to the right of the usual decimal point. A positive number
     * places the cutoff point to the left of the usual decimal point.
     * @param ctx A precision context object to control the rounding mode
     * to use if the result must be scaled down to have the same exponent as
     * this value. The precision setting of this context is ignored. If HasFlags
     * of the context is true, will also store the flags resulting from the
     * operation (the flags are in addition to the pre-existing flags).
     * Can be null, in which case the default rounding mode is HalfEven.
     * @return The quotient of the two objects. Signals FlagDivideByZero
     * and returns infinity if the divisor is 0 and the dividend is nonzero.
     * Signals FlagInvalid and returns NaN if the divisor and the dividend
     * are 0. Signals FlagInvalid and returns NaN if the context defines
     * an exponent range and the desired exponent is outside that range.
     * @throws ArithmeticException The rounding mode is Rounding.Unnecessary
     * and the result is not exact.
     */
    public ExtendedFloat DivideToExponent(
      ExtendedFloat divisor, BigInteger exponent, PrecisionContext ctx) {
      return math.DivideToExponent(this, divisor, exponent, ctx);
    }

    /**
     * Divides two ExtendedFloat objects, and gives a particular exponent
     * to the result.
     * @param divisor An ExtendedFloat object.
     * @param desiredExponent The desired exponent. A negative number
     * places the cutoff point to the right of the usual decimal point. A positive
     * number places the cutoff point to the left of the usual decimal point.
     * @param rounding The rounding mode to use if the result must be scaled
     * down to have the same exponent as this value.
     * @return The quotient of the two objects. Signals FlagDivideByZero
     * and returns infinity if the divisor is 0 and the dividend is nonzero.
     * Signals FlagInvalid and returns NaN if the divisor and the dividend
     * are 0.
     * @throws ArithmeticException The rounding mode is Rounding.Unnecessary
     * and the result is not exact.
     */
    public ExtendedFloat DivideToExponent(
      ExtendedFloat divisor,
      BigInteger desiredExponent,
      Rounding rounding
     ) {
      return DivideToExponent(divisor, desiredExponent, PrecisionContext.ForRounding(rounding));
    }

    /**
     * Finds the absolute value of this object (if it's negative, it becomes
     * positive).
     * @param context A precision context to control precision, rounding,
     * and exponent range of the result. If HasFlags of the context is true,
     * will also store the flags resulting from the operation (the flags
     * are in addition to the pre-existing flags). Can be null.
     * @return The absolute value of this object.
     */
    public ExtendedFloat Abs(PrecisionContext context) {
      return math.Abs(this, context);
    }

    /**
     * Returns a binary float with the same value as this object but with the
     * sign reversed.
     * @param context A precision context to control precision, rounding,
     * and exponent range of the result. If HasFlags of the context is true,
     * will also store the flags resulting from the operation (the flags
     * are in addition to the pre-existing flags). Can be null.
     * @return An ExtendedFloat object.
     */
    public ExtendedFloat Negate(PrecisionContext context) {
      return math.Negate(this, context);
    }

    /**
     * Adds this object and another binary float and returns the result.
     * @param decfrac An ExtendedFloat object.
     * @return The sum of the two objects.
     */
    public ExtendedFloat Add(ExtendedFloat decfrac) {
      return Add(decfrac, PrecisionContext.Unlimited);
    }

    /**
     * Subtracts a ExtendedFloat object from this instance and returns
     * the result..
     * @param decfrac An ExtendedFloat object.
     * @return The difference of the two objects.
     */
    public ExtendedFloat Subtract(ExtendedFloat decfrac) {
      return Subtract(decfrac, null);
    }

    /**
     * Subtracts a ExtendedFloat object from this instance.
     * @param decfrac An ExtendedFloat object.
     * @param ctx A precision context to control precision, rounding, and
     * exponent range of the result. If HasFlags of the context is true, will
     * also store the flags resulting from the operation (the flags are in
     * addition to the pre-existing flags). Can be null.
     * @return The difference of the two objects.
     */
    public ExtendedFloat Subtract(ExtendedFloat decfrac, PrecisionContext ctx) {
      if ((decfrac) == null) throw new NullPointerException("decfrac");
      ExtendedFloat negated = decfrac;
      if ((decfrac.flags & BigNumberFlags.FlagNaN) == 0) {
        int newflags = decfrac.flags ^ BigNumberFlags.FlagNegative;
        negated = CreateWithFlags(decfrac.unsignedMantissa, decfrac.exponent, newflags);
      }
      return Add(negated, ctx);
    }
    /**
     * Multiplies two binary floats. The resulting exponent will be the
     * sum of the exponents of the two binary floats.
     * @param decfrac Another binary float.
     * @return The product of the two binary floats.
     */
    public ExtendedFloat Multiply(ExtendedFloat decfrac) {
      return Multiply(decfrac, PrecisionContext.Unlimited);
    }

    /**
     * Multiplies by one binary float, and then adds another binary float.
     * @param multiplicand The value to multiply.
     * @param augend The value to add.
     * @return The result this * multiplicand + augend.
     */
    public ExtendedFloat MultiplyAndAdd(ExtendedFloat multiplicand,
                                        ExtendedFloat augend) {
      return MultiplyAndAdd(multiplicand, augend, null);
    }
    //----------------------------------------------------------------

    private static RadixMath<ExtendedFloat> math = new RadixMath<ExtendedFloat>(
      new BinaryMathHelper());

    /**
     * Divides this object by another object, and returns the integer part
     * of the result, with the preferred exponent set to this value's exponent
     * minus the divisor's exponent.
     * @param divisor The divisor.
     * @param ctx A precision context object to control the precision, rounding,
     * and exponent range of the integer part of the result. Flags will be
     * set on the given context only if the context&apos;s HasFlags is true
     * and the integer part of the result doesn&apos;t fit the precision
     * and exponent range without rounding.
     * @return The integer part of the quotient of the two objects. Returns
     * null if the return value would overflow the exponent range. A caller
     * can handle a null return value by treating it as positive infinity
     * if both operands have the same sign or as negative infinity if both
     * operands have different signs. Signals FlagDivideByZero and returns
     * infinity if the divisor is 0 and the dividend is nonzero. Signals FlagInvalid
     * and returns NaN if the divisor and the dividend are 0.
     * @throws ArithmeticException The rounding mode is Rounding.Unnecessary
     * and the integer part of the result is not exact.
     */
    public ExtendedFloat DivideToIntegerNaturalScale(
      ExtendedFloat divisor, PrecisionContext ctx) {
      return math.DivideToIntegerNaturalScale(this, divisor, ctx);
    }

    /**
     * Divides this object by another object, and returns the integer part
     * of the result, with the exponent set to 0.
     * @param divisor The divisor.
     * @param ctx A precision context object to control the precision. The
     * rounding and exponent range settings of this context are ignored.
     * If HasFlags of the context is true, will also store the flags resulting
     * from the operation (the flags are in addition to the pre-existing
     * flags). Can be null.
     * @return The integer part of the quotient of the two objects. The exponent
     * will be set to 0. Signals FlagDivideByZero and returns infinity if
     * the divisor is 0 and the dividend is nonzero. Signals FlagInvalid
     * and returns NaN if the divisor and the dividend are 0, or if the result
     * doesn&apos;t fit the given precision.
     */
    public ExtendedFloat DivideToIntegerZeroScale(
      ExtendedFloat divisor, PrecisionContext ctx) {
      return math.DivideToIntegerZeroScale(this, divisor, ctx);
    }

    /**
     * Finds the remainder that results when dividing two ExtendedFloat
     * objects.
     * @param divisor An ExtendedFloat object.
     * @param ctx A PrecisionContext object.
     * @return The remainder of the two objects.
     */
    public ExtendedFloat Remainder(
      ExtendedFloat divisor, PrecisionContext ctx) {
      return math.Remainder(this, divisor, ctx);
    }
    /**
     * Finds the distance to the closest multiple of the given divisor, based
     * on the result of dividing this object's value by another object's
     * value. <ul> <li> If this and the other object divide evenly, the result
     * is 0.</li> <li>If the remainder's absolute value is less than half
     * of the divisor's absolute value, the result has the same sign as this
     * object and will be the distance to the closest multiple.</li> <li>If
     * the remainder's absolute value is more than half of the divisor's
     * absolute value, the result has the opposite sign of this object and
     * will be the distance to the closest multiple.</li> <li>If the remainder's
     * absolute value is exactly half of the divisor's absolute value, the
     * result has the opposite sign of this object if the quotient, rounded
     * down, is odd, and has the same sign as this object if the quotient, rounded
     * down, is even, and the result's absolute value is half of the divisor's
     * absolute value.</li> </ul> This function is also known as the "IEEE
     * Remainder" function.
     * @param divisor The divisor.
     * @param ctx A precision context object to control the precision. The
     * rounding and exponent range settings of this context are ignored
     * (the rounding mode is always ((treated instanceof HalfEven) ? (HalfEven)treated
     * : null)). If HasFlags of the context is true, will also store the flags
     * resulting from the operation (the flags are in addition to the pre-existing
     * flags). Can be null.
     * @return The distance of the closest multiple. Signals FlagInvalidOperation
     * and returns NaN if the divisor is 0, or either the result of integer
     * division (the quotient) or the remainder wouldn&apos;t fit the given
     * precision.
     */
    public ExtendedFloat RemainderNear(
      ExtendedFloat divisor, PrecisionContext ctx) {
      return math.RemainderNear(this, divisor, ctx);
    }

    /**
     * Finds the largest value that's smaller than the given value.
     * @param ctx A precision context object to control the precision and
     * exponent range of the result. The rounding mode from this context
     * is ignored. If HasFlags of the context is true, will also store the
     * flags resulting from the operation (the flags are in addition to the
     * pre-existing flags).
     * @return Returns the largest value that&apos;s less than the given
     * value. Returns negative infinity if the result is negative infinity.
     * @throws java.lang.IllegalArgumentException "ctx" is null, the precision
     * is 0, or "ctx" has an unlimited exponent range.
     */
    public ExtendedFloat NextMinus(
      PrecisionContext ctx
     ) {
      return math.NextMinus(this, ctx);
    }

    /**
     * Finds the smallest value that's greater than the given value.
     * @param ctx A precision context object to control the precision and
     * exponent range of the result. The rounding mode from this context
     * is ignored. If HasFlags of the context is true, will also store the
     * flags resulting from the operation (the flags are in addition to the
     * pre-existing flags).
     * @return Returns the smallest value that&apos;s greater than the
     * given value.
     * @throws java.lang.IllegalArgumentException "ctx" is null, the precision
     * is 0, or "ctx" has an unlimited exponent range.
     */
    public ExtendedFloat NextPlus(
      PrecisionContext ctx
     ) {
      return math.NextPlus(this, ctx);
    }

    /**
     * Finds the next value that is closer to the other object's value than
     * this object's value.
     * @param otherValue An ExtendedFloat object.
     * @param ctx A precision context object to control the precision and
     * exponent range of the result. The rounding mode from this context
     * is ignored. If HasFlags of the context is true, will also store the
     * flags resulting from the operation (the flags are in addition to the
     * pre-existing flags).
     * @return Returns the next value that is closer to the other object&apos;s
     * value than this object&apos;s value.
     * @throws java.lang.IllegalArgumentException "ctx" is null, the precision
     * is 0, or "ctx" has an unlimited exponent range.
     */
    public ExtendedFloat NextToward(
      ExtendedFloat otherValue,
      PrecisionContext ctx
     ) {
      return math.NextToward(this, otherValue, ctx);
    }

    /**
     * Gets the greater value between two binary floats.
     * @param first An ExtendedFloat object.
     * @param second An ExtendedFloat object.
     * @param ctx A precision context to control precision, rounding, and
     * exponent range of the result. If HasFlags of the context is true, will
     * also store the flags resulting from the operation (the flags are in
     * addition to the pre-existing flags). Can be null.
     * @return The larger value of the two objects.
     */
    public static ExtendedFloat Max(
      ExtendedFloat first, ExtendedFloat second, PrecisionContext ctx) {
      return math.Max(first, second, ctx);
    }

    /**
     * Gets the lesser value between two binary floats.
     * @param first An ExtendedFloat object.
     * @param second An ExtendedFloat object.
     * @param ctx A precision context to control precision, rounding, and
     * exponent range of the result. If HasFlags of the context is true, will
     * also store the flags resulting from the operation (the flags are in
     * addition to the pre-existing flags). Can be null.
     * @return The smaller value of the two objects.
     */
    public static ExtendedFloat Min(
      ExtendedFloat first, ExtendedFloat second, PrecisionContext ctx) {
      return math.Min(first, second, ctx);
    }
    /**
     * Gets the greater value between two values, ignoring their signs.
     * If the absolute values are equal, has the same effect as Max.
     * @param first An ExtendedFloat object.
     * @param second An ExtendedFloat object.
     * @param ctx A precision context to control precision, rounding, and
     * exponent range of the result. If HasFlags of the context is true, will
     * also store the flags resulting from the operation (the flags are in
     * addition to the pre-existing flags). Can be null.
     * @return An ExtendedFloat object.
     */
    public static ExtendedFloat MaxMagnitude(
      ExtendedFloat first, ExtendedFloat second, PrecisionContext ctx) {
      return math.MaxMagnitude(first, second, ctx);
    }

    /**
     * Gets the lesser value between two values, ignoring their signs. If
     * the absolute values are equal, has the same effect as Min.
     * @param first An ExtendedFloat object.
     * @param second An ExtendedFloat object.
     * @param ctx A precision context to control precision, rounding, and
     * exponent range of the result. If HasFlags of the context is true, will
     * also store the flags resulting from the operation (the flags are in
     * addition to the pre-existing flags). Can be null.
     * @return An ExtendedFloat object.
     */
    public static ExtendedFloat MinMagnitude(
      ExtendedFloat first, ExtendedFloat second, PrecisionContext ctx) {
      return math.MinMagnitude(first, second, ctx);
    }

    /**
     * Gets the greater value between two binary floats.
     * @param first An ExtendedFloat object.
     * @param second An ExtendedFloat object.
     * @return The larger value of the two objects.
     */
    public static ExtendedFloat Max(
      ExtendedFloat first, ExtendedFloat second) {
      return Max(first, second, null);
    }

    /**
     * Gets the lesser value between two binary floats.
     * @param first An ExtendedFloat object.
     * @param second An ExtendedFloat object.
     * @return The smaller value of the two objects.
     */
    public static ExtendedFloat Min(
      ExtendedFloat first, ExtendedFloat second) {
      return Min(first, second, null);
    }
    /**
     * Gets the greater value between two values, ignoring their signs.
     * If the absolute values are equal, has the same effect as Max.
     * @param first An ExtendedFloat object.
     * @param second An ExtendedFloat object.
     * @return An ExtendedFloat object.
     */
    public static ExtendedFloat MaxMagnitude(
      ExtendedFloat first, ExtendedFloat second) {
      return MaxMagnitude(first, second, null);
    }

    /**
     * Gets the lesser value between two values, ignoring their signs. If
     * the absolute values are equal, has the same effect as Min.
     * @param first An ExtendedFloat object.
     * @param second An ExtendedFloat object.
     * @return An ExtendedFloat object.
     */
    public static ExtendedFloat MinMagnitude(
      ExtendedFloat first, ExtendedFloat second) {
      return MinMagnitude(first, second, null);
    }
    /**
     * Compares the mathematical values of this object and another object,
     * accepting NaN values. <p> This method is not consistent with the Equals
     * method because two different numbers with the same mathematical
     * value, but different exponents, will compare as equal.</p> <p>In
     * this method, negative zero and positive zero are considered equal.</p>
     * <p>If this object or the other object is a quiet NaN or signaling NaN,
     * this method will not trigger an error. Instead, NaN will compare greater
     * than any other number, including infinity. Two different NaN values
     * will be considered equal.</p>
     * @param other An ExtendedFloat object.
     * @return Less than 0 if this object&apos;s value is less than the other
     * value, or greater than 0 if this object&apos;s value is greater than
     * the other value or if &quot;other&quot; is null, or 0 if both values
     * are equal.
     */
    public int compareTo(
      ExtendedFloat other) {
      return math.compareTo(this, other);
    }

    /**
     * Compares the mathematical values of this object and another object.
     * <p>In this method, negative zero and positive zero are considered
     * equal.</p> <p>If this object or the other object is a quiet NaN or signaling
     * NaN, this method returns a quiet NaN, and will signal a FlagInvalid
     * flag if either is a signaling NaN.</p>
     * @param other An ExtendedFloat object.
     * @param ctx A precision context. The precision, rounding, and exponent
     * range are ignored. If HasFlags of the context is true, will store the
     * flags resulting from the operation (the flags are in addition to the
     * pre-existing flags). Can be null.
     * @return Quiet NaN if this object or the other object is NaN, or 0 if both
     * objects have the same value, or -1 if this object is less than the other
     * value, or 1 if this object is greater.
     */
    public ExtendedFloat CompareToWithContext(
      ExtendedFloat other, PrecisionContext ctx) {
      return math.CompareToWithContext(this, other, false, ctx);
    }

    /**
     * Compares the mathematical values of this object and another object,
     * treating quiet NaN as signaling. <p>In this method, negative zero
     * and positive zero are considered equal.</p> <p>If this object or
     * the other object is a quiet NaN or signaling NaN, this method will return
     * a quiet NaN and will signal a FlagInvalid flag.</p>
     * @param other An ExtendedFloat object.
     * @param ctx A precision context. The precision, rounding, and exponent
     * range are ignored. If HasFlags of the context is true, will store the
     * flags resulting from the operation (the flags are in addition to the
     * pre-existing flags). Can be null.
     * @return Quiet NaN if this object or the other object is NaN, or 0 if both
     * objects have the same value, or -1 if this object is less than the other
     * value, or 1 if this object is greater.
     */
    public ExtendedFloat CompareToSignal(
      ExtendedFloat other, PrecisionContext ctx) {
      return math.CompareToWithContext(this, other, true, ctx);
    }

    /**
     * Finds the sum of this object and another object. The result's exponent
     * is set to the lower of the exponents of the two operands.
     * @param decfrac The number to add to.
     * @param ctx A precision context to control precision, rounding, and
     * exponent range of the result. If HasFlags of the context is true, will
     * also store the flags resulting from the operation (the flags are in
     * addition to the pre-existing flags). Can be null.
     * @return The sum of thisValue and the other object.
     */
    public ExtendedFloat Add(
      ExtendedFloat decfrac, PrecisionContext ctx) {
      return math.Add(this, decfrac, ctx);
    }

    /**
     * Returns a binary float with the same value but a new exponent.
     * @param ctx A precision context to control precision and rounding
     * of the result. If HasFlags of the context is true, will also store the
     * flags resulting from the operation (the flags are in addition to the
     * pre-existing flags). Can be null, in which case the default rounding
     * mode is HalfEven.
     * @param desiredExponent The desired exponent of the result. This
     * is the number of fractional digits in the result, expressed as a negative
     * number. Can also be positive, which eliminates lower-order places
     * from the number. For example, -3 means round to the thousandth (10^-3,
     * 0.0001), and 3 means round to the thousand (10^3, 1000). A value of
     * 0 rounds the number to an integer.
     * @return A binary float with the same value as this object but with the
     * exponent changed. Signals FlagInvalid and returns NaN if an overflow
     * error occurred, or the rounded result can&apos;t fit the given precision,
     * or if the context defines an exponent range and the given exponent
     * is outside that range.
     */
    public ExtendedFloat Quantize(
      BigInteger desiredExponent, PrecisionContext ctx) {
      return Quantize(ExtendedFloat.Create(BigInteger.ONE, desiredExponent), ctx);
    }

    /**
     * Returns a binary float with the same value but a new exponent.
     * @param ctx A precision context to control precision and rounding
     * of the result. If HasFlags of the context is true, will also store the
     * flags resulting from the operation (the flags are in addition to the
     * pre-existing flags). Can be null, in which case the default rounding
     * mode is HalfEven.
     * @param desiredExponentSmall The desired exponent of the result.
     * This is the number of fractional digits in the result, expressed as
     * a negative number. Can also be positive, which eliminates lower-order
     * places from the number. For example, -3 means round to the thousandth
     * (10^-3, 0.0001), and 3 means round to the thousand (10^3, 1000). A
     * value of 0 rounds the number to an integer.
     * @return A binary float with the same value as this object but with the
     * exponent changed. Signals FlagInvalid and returns NaN if an overflow
     * error occurred, or the rounded result can&apos;t fit the given precision,
     * or if the context defines an exponent range and the given exponent
     * is outside that range.
     */
    public ExtendedFloat Quantize(
      int desiredExponentSmall, PrecisionContext ctx) {
      return Quantize(ExtendedFloat.Create(BigInteger.ONE, BigInteger.valueOf(desiredExponentSmall)), ctx);
    }

    /**
     * Returns a binary float with the same value as this object but with the
     * same exponent as another binary float.
     * @param otherValue A binary float containing the desired exponent
     * of the result. The mantissa is ignored. The exponent is the number
     * of fractional digits in the result, expressed as a negative number.
     * Can also be positive, which eliminates lower-order places from the
     * number. For example, -3 means round to the thousandth (10^-3, 0.0001),
     * and 3 means round to the thousand (10^3, 1000). A value of 0 rounds the
     * number to an integer.
     * @param ctx A precision context to control precision and rounding
     * of the result. If HasFlags of the context is true, will also store the
     * flags resulting from the operation (the flags are in addition to the
     * pre-existing flags). Can be null, in which case the default rounding
     * mode is HalfEven.
     * @return A binary float with the same value as this object but with the
     * exponent changed. Signals FlagInvalid and returns NaN if an overflow
     * error occurred, or the result can&apos;t fit the given precision
     * without rounding. Signals FlagInvalid and returns NaN if the new
     * exponent is outside of the valid range of the precision context, if
     * it defines an exponent range.
     */
    public ExtendedFloat Quantize(
      ExtendedFloat otherValue, PrecisionContext ctx) {
      return math.Quantize(this, otherValue, ctx);
    }
    /**
     * Returns a binary float with the same value as this object but rounded
     * to an integer.
     * @param ctx A precision context to control precision and rounding
     * of the result. If HasFlags of the context is true, will also store the
     * flags resulting from the operation (the flags are in addition to the
     * pre-existing flags). Can be null, in which case the default rounding
     * mode is HalfEven.
     * @return A binary float with the same value as this object but rounded
     * to an integer. Signals FlagInvalid and returns NaN if an overflow
     * error occurred, or the result can&apos;t fit the given precision
     * without rounding. Signals FlagInvalid and returns NaN if the new
     * exponent must be changed to 0 when rounding and 0 is outside of the valid
     * range of the precision context, if it defines an exponent range.
     */
    public ExtendedFloat RoundToIntegralExact(
      PrecisionContext ctx) {
      return math.RoundToExponentExact(this, BigInteger.ZERO, ctx);
    }
    /**
     * Returns a binary float with the same value as this object but rounded
     * to an integer, without adding the FlagInexact or FlagRounded flags.
     * @param ctx A precision context to control precision and rounding
     * of the result. If HasFlags of the context is true, will also store the
     * flags resulting from the operation (the flags are in addition to the
     * pre-existing flags), except that this function will never add the
     * FlagRounded and FlagInexact flags (the only difference between
     * this and RoundToExponentExact). Can be null, in which case the default
     * rounding mode is HalfEven.
     * @return A binary float with the same value as this object but rounded
     * to an integer. Signals FlagInvalid and returns NaN if an overflow
     * error occurred, or the result can&apos;t fit the given precision
     * without rounding. Signals FlagInvalid and returns NaN if the new
     * exponent must be changed to 0 when rounding and 0 is outside of the valid
     * range of the precision context, if it defines an exponent range.
     */
    public ExtendedFloat RoundToIntegralNoRoundedFlag(
      PrecisionContext ctx) {
      return math.RoundToExponentNoRoundedFlag(this, BigInteger.ZERO, ctx);
    }

    /**
     * Returns a binary float with the same value as this object but rounded
     * to an integer.
     * @param ctx A precision context to control precision and rounding
     * of the result. If HasFlags of the context is true, will also store the
     * flags resulting from the operation (the flags are in addition to the
     * pre-existing flags). Can be null, in which case the default rounding
     * mode is HalfEven.
     * @param exponent A BigInteger object.
     * @return A binary float with the same value as this object but rounded
     * to an integer. Signals FlagInvalid and returns NaN if an overflow
     * error occurred, or the result can&apos;t fit the given precision
     * without rounding. Signals FlagInvalid and returns NaN if the new
     * exponent is outside of the valid range of the precision context, if
     * it defines an exponent range.
     */
    public ExtendedFloat RoundToExponentExact(
      BigInteger exponent, PrecisionContext ctx) {
      return math.RoundToExponentExact(this, exponent, ctx);
    }
    /**
     * Returns a binary float with the same value as this object, and rounds
     * it to a new exponent if necessary.
     * @param exponent The minimum exponent the result can have. This is
     * the maximum number of fractional digits in the result, expressed
     * as a negative number. Can also be positive, which eliminates lower-order
     * places from the number. For example, -3 means round to the thousandth
     * (10^-3, 0.0001), and 3 means round to the thousand (10^3, 1000). A
     * value of 0 rounds the number to an integer.
     * @param ctx A precision context to control precision, rounding, and
     * exponent range of the result. If HasFlags of the context is true, will
     * also store the flags resulting from the operation (the flags are in
     * addition to the pre-existing flags). Can be null, in which case the
     * default rounding mode is HalfEven.
     * @return A binary float rounded to the closest value representable
     * in the given precision, meaning if the result can&apos;t fit the precision,
     * additional digits are discarded to make it fit. Signals FlagInvalid
     * and returns NaN if the new exponent must be changed when rounding and
     * the new exponent is outside of the valid range of the precision context,
     * if it defines an exponent range.
     */
    public ExtendedFloat RoundToExponent(
      BigInteger exponent, PrecisionContext ctx) {
      return math.RoundToExponentSimple(this, exponent, ctx);
    }

    /**
     * Multiplies two binary floats. The resulting scale will be the sum
     * of the scales of the two binary floats. The result's sign is positive
     * if both operands have the same sign, and negative if they have different
     * signs.
     * @param op Another binary float.
     * @param ctx A precision context to control precision, rounding, and
     * exponent range of the result. If HasFlags of the context is true, will
     * also store the flags resulting from the operation (the flags are in
     * addition to the pre-existing flags). Can be null.
     * @return The product of the two binary floats.
     */
    public ExtendedFloat Multiply(
      ExtendedFloat op, PrecisionContext ctx) {
      return math.Multiply(this, op, ctx);
    }
    /**
     * Multiplies by one value, and then adds another value.
     * @param op The value to multiply.
     * @param augend The value to add.
     * @param ctx A precision context to control precision, rounding, and
     * exponent range of the result. If HasFlags of the context is true, will
     * also store the flags resulting from the operation (the flags are in
     * addition to the pre-existing flags). Can be null.
     * @return The result thisValue * multiplicand + augend.
     */
    public ExtendedFloat MultiplyAndAdd(
      ExtendedFloat op, ExtendedFloat augend, PrecisionContext ctx) {
      return math.MultiplyAndAdd(this, op, augend, ctx);
    }
    /**
     * Multiplies by one value, and then subtracts another value.
     * @param op The value to multiply.
     * @param subtrahend The value to subtract.
     * @param ctx A precision context to control precision, rounding, and
     * exponent range of the result. If HasFlags of the context is true, will
     * also store the flags resulting from the operation (the flags are in
     * addition to the pre-existing flags). Can be null.
     * @return The result thisValue * multiplicand - subtrahend.
     */
    public ExtendedFloat MultiplyAndSubtract(
      ExtendedFloat op, ExtendedFloat subtrahend, PrecisionContext ctx) {
      if ((subtrahend) == null) throw new NullPointerException("decfrac");
      ExtendedFloat negated = subtrahend;
      if ((subtrahend.flags & BigNumberFlags.FlagNaN) == 0) {
        int newflags = subtrahend.flags ^ BigNumberFlags.FlagNegative;
        negated = CreateWithFlags(subtrahend.unsignedMantissa, subtrahend.exponent, newflags);
      }
      return math.MultiplyAndAdd(this, op, negated, ctx);
    }

    /**
     * Rounds this object's value to a given precision, using the given rounding
     * mode and range of exponent.
     * @param ctx A context for controlling the precision, rounding mode,
     * and exponent range. Can be null.
     * @return The closest value to this object&apos;s value, rounded to
     * the specified precision. Returns the same value as this object if
     * &quot;context&quot; is null or the precision and exponent range
     * are unlimited.
     */
    public ExtendedFloat RoundToPrecision(
      PrecisionContext ctx) {
      return math.RoundToPrecision(this, ctx);
    }

    /**
     * Rounds this object's value to a given precision, using the given rounding
     * mode and range of exponent, and also converts negative zero to positive
     * zero.
     * @param ctx A context for controlling the precision, rounding mode,
     * and exponent range. Can be null.
     * @return The closest value to this object&apos;s value, rounded to
     * the specified precision. Returns the same value as this object if
     * &quot;context&quot; is null or the precision and exponent range
     * are unlimited.
     */
    public ExtendedFloat Plus(
      PrecisionContext ctx) {
      return math.Plus(this, ctx);
    }

    /**
     * Rounds this object's value to a given maximum bit length, using the
     * given rounding mode and range of exponent.
     * @param ctx A context for controlling the precision, rounding mode,
     * and exponent range. The precision is interpreted as the maximum bit
     * length of the mantissa. Can be null.
     * @return The closest value to this object&apos;s value, rounded to
     * the specified precision. Returns the same value as this object if
     * &quot;context&quot; is null or the precision and exponent range
     * are unlimited.
     */
    public ExtendedFloat RoundToBinaryPrecision(
      PrecisionContext ctx) {
      return math.RoundToBinaryPrecision(this, ctx);
    }

    /**
     *
     * @param ctx A PrecisionContext object.
     * @return An ExtendedDecimal object.
     */
    public ExtendedFloat SquareRoot(PrecisionContext ctx) {
      return math.SquareRoot(this,ctx);
    }
    /**
     * Finds e (the base of natural logarithms) raised to the power of this
     * object's value.
     * @param ctx A precision context to control precision and exponent
     * range of the result. The rounding mode is ignored and is always HalfEven.
     * If HasFlags of the context is true, will also store the flags resulting
     * from the operation (the flags are in addition to the pre-existing
     * flags). --This parameter cannot be null, as the exp function&apos;s
     * results are generally not exact.--
     * @return exp(this object). Signals the flag FlagInvalid and returns
     * NaN if &quot;ctx&quot; is null or the precision range is unlimited.
     */
    public ExtendedFloat Exp(PrecisionContext ctx) {
      return math.Exp(this,ctx);
    }

    /**
     * Finds the constant pi.
     * @param ctx A precision context to control precision, rounding, and
     * exponent range of the result. If HasFlags of the context is true, will
     * also store the flags resulting from the operation (the flags are in
     * addition to the pre-existing flags). --This parameter cannot be
     * null, as pi can never be represented exactly.--
     * @return Pi rounded to the given precision. Signals the flag FlagInvalid
     * and returns NaN if &quot;ctx&quot; is null or the precision range
     * is unlimited.
     */
    public static ExtendedFloat PI(PrecisionContext ctx) {
      return math.Pi(ctx);
    }
  }

