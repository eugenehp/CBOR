package com.upokecenter.util;
/*
Written in 2013 by Peter O.
Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://peteroupc.github.io/CBOR/
 */

import java.util.*;

import java.io.*;
//import java.math.*;

    /**
     * Represents an object in Concise Binary Object Representation (CBOR)
     * and contains methods for reading and writing CBOR data. CBOR is defined
     * in RFC 7049. <p> Thread Safety: CBOR objects that are numbers, "simple
     * values", and text strings are immutable (their values can't be changed),
     * so they are inherently safe for use by multiple threads. CBOR objects
     * that are arrays, maps, and byte strings are mutable, but this class
     * doesn't attempt to synchronize reads and writes to those objects
     * by multiple threads, so those objects are not thread safe without
     * such synchronization. </p>
     */
  public final class CBORObject implements Comparable<CBORObject> {
    int getItemType(){
        CBORObject curobject = this;
        while (curobject.itemtype_ == CBORObjectType_Tagged) {
          curobject = ((CBORObject)curobject.item_);
        }
        return curobject.itemtype_;
      }
    Object getThisItem(){
        CBORObject curobject = this;
        while (curobject.itemtype_ == CBORObjectType_Tagged) {
          curobject = ((CBORObject)curobject.item_);
        }
        return curobject.item_;
      }
    int itemtype_;
    Object item_;
    int tagLow;
    int tagHigh;
    static final int CBORObjectType_Integer = 0; // -(2^63) .. (2^63-1)
    static final int CBORObjectType_BigInteger = 1; // all other integers
    static final int CBORObjectType_ByteString = 2;
    static final int CBORObjectType_TextString = 3;
    static final int CBORObjectType_Array = 4;
    static final int CBORObjectType_Map = 5;
    static final int CBORObjectType_SimpleValue = 6;
    static final int CBORObjectType_Single = 7;
    static final int CBORObjectType_Double = 8;
    static final int CBORObjectType_ExtendedDecimal = 9;
    static final int CBORObjectType_Tagged = 10;
    static final int CBORObjectType_ExtendedFloat = 11;
    private static final BigInteger Int64MaxValue = BigInteger.valueOf(Long.MAX_VALUE);
    private static final BigInteger Int64MinValue = BigInteger.valueOf(Long.MIN_VALUE);
    /**
     * Represents the value false.
     */

    public static final CBORObject False = new CBORObject(CBORObjectType_SimpleValue, 20);
    /**
     * Represents the value true.
     */

    public static final CBORObject True = new CBORObject(CBORObjectType_SimpleValue, 21);
    /**
     * Represents the value null.
     */

    public static final CBORObject Null = new CBORObject(CBORObjectType_SimpleValue, 22);
    /**
     * Represents the value undefined.
     */

    public static final CBORObject Undefined = new CBORObject(CBORObjectType_SimpleValue, 23);
    private CBORObject() { }
    private CBORObject(CBORObject obj, int tagLow, int tagHigh){
 this(CBORObjectType_Tagged, obj);
      this.tagLow = tagLow;
      this.tagHigh = tagHigh;
    }
    private CBORObject(int type, Object item) {

      this.itemtype_ = type;
      this.item_ = item;
    }
    /**
     * Gets the general data type of this CBOR object.
     */
    public CBORType getType() {
        switch (this.getItemType()) {
          case CBORObjectType_Integer:
          case CBORObjectType_BigInteger:
          case CBORObjectType_Single:
          case CBORObjectType_Double:
          case CBORObjectType_ExtendedDecimal:
          case CBORObjectType_ExtendedFloat:
            return CBORType.Number;
          case CBORObjectType_SimpleValue:
            if (((Integer)this.getThisItem()).intValue() == 21 || ((Integer)this.getThisItem()).intValue() == 20) {
              return CBORType.Boolean;
            }
            return CBORType.SimpleValue;
          case CBORObjectType_Array:
            return CBORType.Array;
          case CBORObjectType_Map:
            return CBORType.Map;
          case CBORObjectType_ByteString:
            return CBORType.ByteString;
          case CBORObjectType_TextString:
            return CBORType.TextString;
          default:
            throw new IllegalStateException("Unexpected data type");
        }
      }
    /**
     * Gets whether this value is a CBOR true value.
     */
    public boolean isTrue() {
        return this.getItemType() == CBORObjectType_SimpleValue && ((Integer)this.getThisItem()).intValue() == 21;
      }
    /**
     * Gets whether this value is a CBOR false value.
     */
    public boolean isFalse() {
        return this.getItemType() == CBORObjectType_SimpleValue && ((Integer)this.getThisItem()).intValue() == 20;
      }
    /**
     * Gets whether this value is a CBOR null value.
     */
    public boolean isNull() {
        return this.getItemType() == CBORObjectType_SimpleValue && ((Integer)this.getThisItem()).intValue() == 22;
      }
    /**
     * Gets whether this value is a CBOR undefined value.
     */
    public boolean isUndefined() {
        return this.getItemType() == CBORObjectType_SimpleValue && ((Integer)this.getThisItem()).intValue() == 23;
      }
    /**
     * Gets whether this object's value equals 0.
     */
    public boolean isZero() {
        switch (this.getItemType()) {
          case CBORObject.CBORObjectType_Integer:
            return ((((Long)this.getThisItem()).longValue())) == 0;
          case CBORObject.CBORObjectType_BigInteger:
            return ((BigInteger)this.getThisItem()).signum()==0;
          case CBORObject.CBORObjectType_Single:
            return (((Float)this.getThisItem()).floatValue()) == 0;
          case CBORObject.CBORObjectType_Double:
            return (((Double)this.getThisItem()).doubleValue()) == 0;
          case CBORObject.CBORObjectType_ExtendedDecimal:
            return ((ExtendedDecimal)this.getThisItem()).signum()==0;
          case CBORObject.CBORObjectType_ExtendedFloat:
            return ((ExtendedFloat)this.getThisItem()).signum()==0;
          default:
            return false;
        }
      }
    /**
     * Gets this object's value with the sign reversed.
     * @return A CBORObject object.
     * @throws java.lang.IllegalStateException This object's type is
     * not a number type.
     */
    public CBORObject Negate() {
      switch (this.getItemType()) {
        case CBORObject.CBORObjectType_Integer:
          if (((((Long)this.getThisItem()).longValue())) == Long.MIN_VALUE)
            return CBORObject.FromObject(OneShift63);
          return CBORObject.FromObject(-((((Long)this.getThisItem()).longValue())));
          case CBORObject.CBORObjectType_BigInteger: {
            BigInteger bigint = (BigInteger)this.getThisItem();
            bigint=bigint.negate();
            return CBORObject.FromObject(bigint);
          }
        case CBORObject.CBORObjectType_Single:
          return CBORObject.FromObject(-(((Float)this.getThisItem()).floatValue()));
        case CBORObject.CBORObjectType_Double:
          return CBORObject.FromObject(-(((Double)this.getThisItem()).doubleValue()));
        case CBORObject.CBORObjectType_ExtendedDecimal:
          return CBORObject.FromObject(((ExtendedDecimal)this.getThisItem()).Negate());
        case CBORObject.CBORObjectType_ExtendedFloat:
          return CBORObject.FromObject(((ExtendedFloat)this.getThisItem()).Negate());
        default:
          throw new IllegalStateException("This Object is not a number.");
      }
    }
    private static int GetSignInternal(int type, Object obj, boolean returnOnNaN) {
      switch (type) {
          case CBORObject.CBORObjectType_Integer: {
            long value = ((((Long)obj).longValue()));
            return (value == 0) ? 0 : ((value < 0) ? -1 : 1);
          }
        case CBORObject.CBORObjectType_BigInteger:
          return ((BigInteger)obj).signum();
          case CBORObject.CBORObjectType_Single: {
            float value = ((Float)obj).floatValue();
            if (Float.isNaN(value))
              if (returnOnNaN)
                return 2;
              else
                throw new IllegalStateException("This Object is not a number.");
            return (int)((value==0) ? 0 : ((value<0) ? -1 : 1));
          }
          case CBORObject.CBORObjectType_Double: {
            double value = ((Double)obj).doubleValue();
            if (Double.isNaN(value))
              if (returnOnNaN)
                return 2;
              else
                throw new IllegalStateException("This Object is not a number.");
            return (int)((value==0) ? 0 : ((value<0) ? -1 : 1));
          }
        case CBORObject.CBORObjectType_ExtendedDecimal:
          return ((ExtendedDecimal)obj).signum();
        case CBORObject.CBORObjectType_ExtendedFloat:
          return ((ExtendedFloat)obj).signum();
        default:
          if (returnOnNaN)
            return 2; // not a number type
          else
            throw new IllegalStateException("This Object is not a number.");
      }
    }
    /**
     * Gets this value's sign: -1 if negative; 1 if positive; 0 if zero.
     * @throws java.lang.IllegalStateException This object's type is
     * not a number type, including the special not-a-number value (NaN).
     */
    public int signum() {
        return GetSignInternal(this.getItemType(), this.getThisItem(), false);
      }
    /**
     * Gets whether this CBOR object represents positive infinity.
     * @return A Boolean object.
     */
    public boolean IsPositiveInfinity() {
      switch (this.getItemType()) {
          case CBORObject.CBORObjectType_Single: {
            float value = ((Float)this.getThisItem()).floatValue();
            return ((Float)(value)).isInfinite() && value > 0;
          }
          case CBORObject.CBORObjectType_Double: {
            double value = ((Double)this.getThisItem()).doubleValue();
            return ((Double)(value)).isInfinite() && value > 0;
          }
        case CBORObject.CBORObjectType_ExtendedDecimal:
          return ((ExtendedDecimal)this.getThisItem()).IsPositiveInfinity();
        case CBORObject.CBORObjectType_ExtendedFloat:
          return ((ExtendedFloat)this.getThisItem()).IsPositiveInfinity();
        default:
          return false;
      }
    }

    /**
     *
     * @return A Boolean object.
     */
public boolean IsInfinity() {
      return IsPositiveInfinity() || IsNegativeInfinity();
    }

    /**
     * Gets whether this CBOR object represents negative infinity.
     * @return A Boolean object.
     */
    public boolean IsNegativeInfinity() {
      switch (this.getItemType()) {
          case CBORObject.CBORObjectType_Single: {
            float value = ((Float)this.getThisItem()).floatValue();
            return ((Float)(value)).isInfinite() && value < 0;
          }
          case CBORObject.CBORObjectType_Double: {
            double value = ((Double)this.getThisItem()).doubleValue();
            return ((Double)(value)).isInfinite() && value < 0;
          }
        case CBORObject.CBORObjectType_ExtendedDecimal:
          return ((ExtendedDecimal)this.getThisItem()).IsNegativeInfinity();
        case CBORObject.CBORObjectType_ExtendedFloat:
          return ((ExtendedFloat)this.getThisItem()).IsNegativeInfinity();
        default:
          return false;
      }
    }
    /**
     * Gets whether this CBOR object represents a not-a-number value (as
     * opposed to whether this object's type is not a number type).
     * @return A Boolean object.
     */
    public boolean IsNaN() {
      switch (this.getItemType()) {
        case CBORObject.CBORObjectType_Single:
          return Float.isNaN(((Float)this.getThisItem()).floatValue());
        case CBORObject.CBORObjectType_Double:
          return Double.isNaN(((Double)this.getThisItem()).doubleValue());
        case CBORObject.CBORObjectType_ExtendedDecimal:
          return ((ExtendedDecimal)this.getThisItem()).IsNaN();
        case CBORObject.CBORObjectType_ExtendedFloat:
          return ((ExtendedFloat)this.getThisItem()).IsNaN();
        default:
          return false;
      }
    }
    /**
     * Compares two CBOR objects. <p> In this implementation:</p> <ul>
     * <li> If either value is true, it is treated as the number 1.</li> <li>
     * If either value is false, CBORObject.Null, or the undefined value,
     * it is treated as the number 0.</li> <li> If both objects are numbers,
     * their mathematical values are compared. Here, NaN (not-a-number)
     * is considered greater than any number.</li> <li> If both objects
     * are arrays, each element is compared. If one array is shorter than
     * the other and the other array begins with that array (for the purposes
     * of comparison), the shorter array is considered less than the longer
     * array.</li> <li> If both objects are strings, compares each string
     * code-point by code-point.</li> <li> If both objects are maps, returns
     * 0.</li> <li> If each object is a different type, then they are sorted
     * by their type number, in the order given for the CBORType enumeration.</li>
     * <p> This method is not consistent with the Equals method.</p> </ul>
     * @param other A value to compare with.
     * @return Less than 0, if this value is less than the other object; or
     * 0, if both values are equal; or greater than 0, if this value is less
     * than the other object or if the other object is null.
     */
    @SuppressWarnings("unchecked")
public int compareTo(CBORObject other) {
      if (other == null) return 1;
      int typeA = this.getItemType();
      int typeB = other.getItemType();
      Object objA = this.getThisItem();
      Object objB = other.getThisItem();
      if (typeA == CBORObjectType_SimpleValue) {
        if (((Integer)objA).intValue() == 20 || ((Integer)objA).intValue() == 22 || ((Integer)objA).intValue() == 23) {
          // Treat false, null, and undefined
          // as the number 0
          objA = (long)0;
          typeA = CBORObjectType_Integer;
        } else if (((Integer)objA).intValue() == 21) {
          // Treat true as the number 1
          objA = (long)1;
          typeA = CBORObjectType_Integer;
        }
      }
      if (typeB == CBORObjectType_SimpleValue) {
        if (((Integer)objB).intValue() == 20 || ((Integer)objB).intValue() == 22 || ((Integer)objB).intValue() == 23) {
          // Treat false, null, and undefined
          // as the number 0
          objB = (long)0;
          typeB = CBORObjectType_Integer;
        } else if (((Integer)objB).intValue() == 21) {
          // Treat true as the number 1
          objB = (long)1;
          typeB = CBORObjectType_Integer;
        }
      }
      if (typeA == typeB) {
        switch (typeA) {
            case CBORObjectType_Integer: {
              long a = (((Long)objA).longValue());
              long b = (((Long)objB).longValue());
              if (a == b) return 0;
              return (a < b) ? -1 : 1;
            }
            case CBORObjectType_Single: {
              float a = ((Float)objA).floatValue();
              float b = ((Float)objB).floatValue();
              // Treat NaN as greater than all other numbers
              if (Float.isNaN(a)) {
                return (Float.isNaN(b)) ? 0 : 1;
              }
              if (Float.isNaN(b)) {
                return -1;
              }
              if (a == b) return 0;
              return (a < b) ? -1 : 1;
            }
            case CBORObjectType_BigInteger: {
              BigInteger bigintA = (BigInteger)objA;
              BigInteger bigintB = (BigInteger)objB;
              return bigintA.compareTo(bigintB);
            }
            case CBORObjectType_Double: {
              double a = ((Double)objA).doubleValue();
              double b = ((Double)objB).doubleValue();
              // Treat NaN as greater than all other numbers
              if (Double.isNaN(a)) {
                return (Double.isNaN(b)) ? 0 : 1;
              }
              if (Double.isNaN(b)) {
                return -1;
              }
              if (a == b) return 0;
              return (a < b) ? -1 : 1;
            }
            case CBORObjectType_ExtendedDecimal: {
              return ((ExtendedDecimal)objA).compareTo(
                ((ExtendedDecimal)objB));
            }
            case CBORObjectType_ExtendedFloat: {
              return ((ExtendedFloat)objA).compareTo(
                ((ExtendedFloat)objB));
            }
            case CBORObjectType_ByteString: {
              return CBORUtilities.ByteArrayCompare((byte[])objA, (byte[])objB);
            }
            case CBORObjectType_TextString: {
              return DataUtilities.CodePointCompare(
                (String)objA, (String)objB);
            }
            case CBORObjectType_Array: {
              return ListCompare((ArrayList<CBORObject>)objA,
                                 (ArrayList<CBORObject>)objB);
            }
            case CBORObjectType_Map: {
              return 0;
            }
            case CBORObjectType_SimpleValue: {
              int valueA = ((Integer)objA).intValue();
              int valueB = ((Integer)objB).intValue();
              if (valueA == valueB) return 0;
              return (valueA < valueB) ? -1 : 1;
            }
          default:
            throw new IllegalArgumentException("Unexpected data type");
        }
      } else {
        int combo = (typeA << 4) | typeB;
        int s1 = GetSignInternal(typeA, objA, true);
        int s2 = GetSignInternal(typeB, objB, true);
        if (s1 != s2 && s1 != 2 && s2 != 2) {
          // if both types are numbers
          // and their signs are different
          return (s1 < s2) ? -1 : 1;
        }
        BigInteger bigintXa;
        BigInteger bigintXb;
        ExtendedFloat bigfloatXa;
        ExtendedFloat bigfloatXb;
        ExtendedDecimal decfracXa;
        ExtendedDecimal decfracXb;
        switch (combo) {
            case (CBORObjectType_Integer << 4) | CBORObjectType_BigInteger: {
              bigintXa = BigInteger.valueOf((((Long)objA).longValue()));
              bigintXb = (BigInteger)objB;
              return bigintXa.compareTo(bigintXb);
            }
            case (CBORObjectType_Integer << 4) | CBORObjectType_Single: {
              float sf = ((Float)objB).floatValue();
              if (((Float)(sf)).isInfinite()) return (sf < 0 ? 1 : -1);
              if (Float.isNaN(sf)) return -1;
              bigfloatXa = ExtendedFloat.FromInt64((((Long)objA).longValue()));
              bigfloatXb = ExtendedFloat.FromSingle(sf);
              return bigfloatXa.compareTo(bigfloatXb);
            }
            case (CBORObjectType_Integer << 4) | CBORObjectType_Double: {
              double sf = ((Double)objB).doubleValue();
              if (((Double)(sf)).isInfinite()) return (sf < 0 ? 1 : -1);
              if (Double.isNaN(sf)) return -1;
              bigfloatXa = ExtendedFloat.FromInt64((((Long)objA).longValue()));
              bigfloatXb = ExtendedFloat.FromDouble(sf);
              return bigfloatXa.compareTo(bigfloatXb);
            }
            case (CBORObjectType_Integer << 4) | CBORObjectType_ExtendedDecimal: {
              decfracXa = ExtendedDecimal.FromInt64((((Long)objA).longValue()));
              decfracXb = (ExtendedDecimal)objB;
              return decfracXa.compareTo(decfracXb);
            }
            case (CBORObjectType_Integer << 4) | CBORObjectType_ExtendedFloat: {
              bigfloatXa = ExtendedFloat.FromInt64((((Long)objA).longValue()));
              bigfloatXb = (ExtendedFloat)objB;
              return bigfloatXa.compareTo(bigfloatXb);
            }
            case (CBORObjectType_BigInteger << 4) | CBORObjectType_Integer: {
              bigintXa = (BigInteger)objA;
              bigintXb = BigInteger.valueOf((((Long)objB).longValue()));
              return bigintXa.compareTo(bigintXb);
            }
            case (CBORObjectType_BigInteger << 4) | CBORObjectType_Single: {
              float sf = ((Float)objB).floatValue();
              if (((Float)(sf)).isInfinite()) return (sf < 0 ? 1 : -1);
              if (Float.isNaN(sf)) return -1;
              bigfloatXa = ExtendedFloat.FromBigInteger((BigInteger)objA);
              bigfloatXb = ExtendedFloat.FromSingle(sf);
              return bigfloatXa.compareTo(bigfloatXb);
            }
            case (CBORObjectType_BigInteger << 4) | CBORObjectType_Double: {
              double sf = ((Double)objB).doubleValue();
              if (((Double)(sf)).isInfinite()) return (sf < 0 ? 1 : -1);
              if (Double.isNaN(sf)) return -1;
              bigfloatXa = ExtendedFloat.FromBigInteger((BigInteger)objA);
              bigfloatXb = ExtendedFloat.FromDouble(sf);
              return bigfloatXa.compareTo(bigfloatXb);
            }
            case (CBORObjectType_BigInteger << 4) | CBORObjectType_ExtendedDecimal: {
              decfracXa = ExtendedDecimal.FromBigInteger((BigInteger)objA);
              decfracXb = (ExtendedDecimal)objB;
              return decfracXa.compareTo(decfracXb);
            }
            case (CBORObjectType_BigInteger << 4) | CBORObjectType_ExtendedFloat: {
              bigfloatXa = ExtendedFloat.FromBigInteger((BigInteger)objA);
              bigfloatXb = (ExtendedFloat)objB;
              return bigfloatXa.compareTo(bigfloatXb);
            }
            case (CBORObjectType_Single << 4) | CBORObjectType_Integer: {
              float sf = ((Float)objA).floatValue();
              if (((Float)(sf)).isInfinite()) return (sf < 0 ? -1 : 1);

              if (Float.isNaN(sf)) return 1;
              bigfloatXa = ExtendedFloat.FromSingle(sf);
              bigfloatXb = ExtendedFloat.FromInt64((((Long)objB).longValue()));
              return bigfloatXa.compareTo(bigfloatXb);
            }
            case (CBORObjectType_Single << 4) | CBORObjectType_BigInteger: {
              float sf = ((Float)objA).floatValue();
              if (((Float)(sf)).isInfinite()) return (sf < 0 ? -1 : 1);
              if (Float.isNaN(sf)) return 1;
              bigfloatXa = ExtendedFloat.FromSingle(sf);
              bigfloatXb = ExtendedFloat.FromBigInteger((BigInteger)objB);
              return bigfloatXa.compareTo(bigfloatXb);
            }
            case (CBORObjectType_Single << 4) | CBORObjectType_Double: {
              double a = ((Float)objA).doubleValue();
              double b = ((Double)objB).doubleValue();
              // Treat NaN as greater than all other numbers
              if (Double.isNaN(a)) {
                return (Double.isNaN(b)) ? 0 : 1;
              }
              if (Double.isNaN(b)) {
                return -1;
              }
              if (a == b) return 0;
              return (a < b) ? -1 : 1;
            }
            case (CBORObjectType_Single << 4) | CBORObjectType_ExtendedDecimal: {
              float sf = ((Float)objA).floatValue();
              if (((Float)(sf)).isInfinite()) return (sf < 0 ? -1 : 1);
              if (Float.isNaN(sf)) return 1;
              decfracXa = ExtendedDecimal.FromSingle(sf);
              decfracXb = (ExtendedDecimal)objB;
              return decfracXa.compareTo(decfracXb);
            }
            case (CBORObjectType_Single << 4) | CBORObjectType_ExtendedFloat: {
              float sf = ((Float)objA).floatValue();
              if (((Float)(sf)).isInfinite()) return (sf < 0 ? -1 : 1);
              if (Float.isNaN(sf)) return 1;
              bigfloatXa = ExtendedFloat.FromSingle(sf);
              bigfloatXb = (ExtendedFloat)objB;
              return bigfloatXa.compareTo(bigfloatXb);
            }
            case (CBORObjectType_Double << 4) | CBORObjectType_Integer: {
              double sf = ((Double)objA).doubleValue();
              if (((Double)(sf)).isInfinite()) return (sf < 0 ? -1 : 1);
              if (Double.isNaN(sf)) return 1;
              bigfloatXa = ExtendedFloat.FromDouble(sf);
              bigfloatXb = ExtendedFloat.FromInt64((((Long)objB).longValue()));
              return bigfloatXa.compareTo(bigfloatXb);
            }
            case (CBORObjectType_Double << 4) | CBORObjectType_BigInteger: {
              double sf = ((Double)objA).doubleValue();
              if (((Double)(sf)).isInfinite()) return (sf < 0 ? -1 : 1);
              if (Double.isNaN(sf)) return 1;
              bigfloatXa = ExtendedFloat.FromDouble(sf);
              bigfloatXb = ExtendedFloat.FromBigInteger((BigInteger)objB);
              return bigfloatXa.compareTo(bigfloatXb);
            }
            case (CBORObjectType_Double << 4) | CBORObjectType_Single: {
              double a = ((Double)objA).doubleValue();
              double b = ((Float)objB).doubleValue();
              // Treat NaN as greater than all other numbers
              if (Double.isNaN(a)) {
                return (Double.isNaN(b)) ? 0 : 1;
              }
              if (Double.isNaN(b)) {
                return -1;
              }
              if (a == b) return 0;
              return (a < b) ? -1 : 1;
            }
            case (CBORObjectType_Double << 4) | CBORObjectType_ExtendedDecimal: {
              double sf = ((Double)objA).doubleValue();
              if (((Double)(sf)).isInfinite()) return (sf < 0 ? -1 : 1);
              if (Double.isNaN(sf)) return 1;
              decfracXa = ExtendedDecimal.FromDouble(sf);
              decfracXb = (ExtendedDecimal)objB;
              return decfracXa.compareTo(decfracXb);
            }
            case (CBORObjectType_Double << 4) | CBORObjectType_ExtendedFloat: {
              double sf = ((Double)objA).doubleValue();
              if (((Double)(sf)).isInfinite()) return (sf < 0 ? -1 : 1);
              if (Double.isNaN(sf)) return 1;
              bigfloatXa = ExtendedFloat.FromDouble(sf);
              bigfloatXb = (ExtendedFloat)objB;
              return bigfloatXa.compareTo(bigfloatXb);
            }
            case (CBORObjectType_ExtendedDecimal << 4) | CBORObjectType_Integer: {
              decfracXa = (ExtendedDecimal)objA;
              decfracXb = ExtendedDecimal.FromInt64((((Long)objB).longValue()));
              return decfracXa.compareTo(decfracXb);
            }
            case (CBORObjectType_ExtendedDecimal << 4) | CBORObjectType_BigInteger: {
              decfracXa = (ExtendedDecimal)objA;
              decfracXb = ExtendedDecimal.FromBigInteger((BigInteger)objB);
              return decfracXa.compareTo(decfracXb);
            }
            case (CBORObjectType_ExtendedDecimal << 4) | CBORObjectType_Single: {
              float sf = ((Float)objB).floatValue();
              if (((Float)(sf)).isInfinite()) return (sf < 0 ? 1 : -1);
              if (Float.isNaN(sf)) return -1;
              decfracXa = (ExtendedDecimal)objA;
              decfracXb = ExtendedDecimal.FromSingle(sf);
              return decfracXa.compareTo(decfracXb);
            }
            case (CBORObjectType_ExtendedDecimal << 4) | CBORObjectType_Double: {
              double sf = ((Double)objB).doubleValue();
              if (((Double)(sf)).isInfinite()) return (sf < 0 ? 1 : -1);
              if (Double.isNaN(sf)) return -1;
              decfracXa = (ExtendedDecimal)objA;
              decfracXb = ExtendedDecimal.FromDouble(sf);
              return decfracXa.compareTo(decfracXb);
            }
            case (CBORObjectType_ExtendedDecimal << 4) | CBORObjectType_ExtendedFloat: {
              decfracXa = (ExtendedDecimal)objA;
              decfracXb = ExtendedDecimal.FromExtendedFloat((ExtendedFloat)objB);
              return decfracXa.compareTo(decfracXb);
            }
            case (CBORObjectType_ExtendedFloat << 4) | CBORObjectType_Integer: {
              bigfloatXa = (ExtendedFloat)objA;
              bigfloatXb = ExtendedFloat.FromInt64((((Long)objB).longValue()));
              return bigfloatXa.compareTo(bigfloatXb);
            }
            case (CBORObjectType_ExtendedFloat << 4) | CBORObjectType_BigInteger: {
              bigfloatXa = (ExtendedFloat)objA;
              bigfloatXb = ExtendedFloat.FromBigInteger((BigInteger)objB);
              return bigfloatXa.compareTo(bigfloatXb);
            }
            case (CBORObjectType_ExtendedFloat << 4) | CBORObjectType_Single: {
              float sf = ((Float)objB).floatValue();
              if (((Float)(sf)).isInfinite()) return (sf < 0 ? 1 : -1);
              if (Float.isNaN(sf)) return -1;
              bigfloatXa = (ExtendedFloat)objA;
              bigfloatXb = ExtendedFloat.FromSingle(sf);
              return bigfloatXa.compareTo(bigfloatXb);
            }
            case (CBORObjectType_ExtendedFloat << 4) | CBORObjectType_Double: {
              double sf = ((Double)objB).doubleValue();
              if (((Double)(sf)).isInfinite()) return (sf < 0 ? 1 : -1);
              if (Double.isNaN(sf)) return -1;
              bigfloatXa = (ExtendedFloat)objA;
              bigfloatXb = ExtendedFloat.FromDouble(sf);
              return bigfloatXa.compareTo(bigfloatXb);
            }
            case (CBORObjectType_ExtendedFloat << 4) | CBORObjectType_ExtendedDecimal: {
              decfracXa = ExtendedDecimal.FromExtendedFloat((ExtendedFloat)objA);
              decfracXb = (ExtendedDecimal)objB;
              return decfracXa.compareTo(decfracXb);
            }
          case (CBORObjectType_ExtendedFloat << 4) | CBORObjectType_SimpleValue:
          case (CBORObjectType_ExtendedFloat << 4) | CBORObjectType_ByteString:
          case (CBORObjectType_ExtendedFloat << 4) | CBORObjectType_TextString:
          case (CBORObjectType_ExtendedFloat << 4) | CBORObjectType_Array:
          case (CBORObjectType_ExtendedFloat << 4) | CBORObjectType_Map:
            return -1;
          case (CBORObjectType_SimpleValue << 4) | CBORObjectType_ExtendedFloat:
          case (CBORObjectType_ByteString << 4) | CBORObjectType_ExtendedFloat:
          case (CBORObjectType_TextString << 4) | CBORObjectType_ExtendedFloat:
          case (CBORObjectType_Array << 4) | CBORObjectType_ExtendedFloat:
          case (CBORObjectType_Map << 4) | CBORObjectType_ExtendedFloat:
            return 1;
          case (CBORObjectType_Integer << 4) | CBORObjectType_SimpleValue:
          case (CBORObjectType_Integer << 4) | CBORObjectType_ByteString:
          case (CBORObjectType_Integer << 4) | CBORObjectType_TextString:
          case (CBORObjectType_Integer << 4) | CBORObjectType_Array:
          case (CBORObjectType_Integer << 4) | CBORObjectType_Map:
          case (CBORObjectType_BigInteger << 4) | CBORObjectType_SimpleValue:
          case (CBORObjectType_BigInteger << 4) | CBORObjectType_ByteString:
          case (CBORObjectType_BigInteger << 4) | CBORObjectType_TextString:
          case (CBORObjectType_BigInteger << 4) | CBORObjectType_Array:
          case (CBORObjectType_BigInteger << 4) | CBORObjectType_Map:
          case (CBORObjectType_Single << 4) | CBORObjectType_SimpleValue:
          case (CBORObjectType_Single << 4) | CBORObjectType_ByteString:
          case (CBORObjectType_Single << 4) | CBORObjectType_TextString:
          case (CBORObjectType_Single << 4) | CBORObjectType_Array:
          case (CBORObjectType_Single << 4) | CBORObjectType_Map:
          case (CBORObjectType_Double << 4) | CBORObjectType_SimpleValue:
          case (CBORObjectType_Double << 4) | CBORObjectType_ByteString:
          case (CBORObjectType_Double << 4) | CBORObjectType_TextString:
          case (CBORObjectType_Double << 4) | CBORObjectType_Array:
          case (CBORObjectType_Double << 4) | CBORObjectType_Map:
          case (CBORObjectType_ExtendedDecimal << 4) | CBORObjectType_SimpleValue:
          case (CBORObjectType_ExtendedDecimal << 4) | CBORObjectType_ByteString:
          case (CBORObjectType_ExtendedDecimal << 4) | CBORObjectType_TextString:
          case (CBORObjectType_ExtendedDecimal << 4) | CBORObjectType_Array:
          case (CBORObjectType_ExtendedDecimal << 4) | CBORObjectType_Map:
          case (CBORObjectType_SimpleValue << 4) | CBORObjectType_ByteString:
          case (CBORObjectType_SimpleValue << 4) | CBORObjectType_TextString:
          case (CBORObjectType_SimpleValue << 4) | CBORObjectType_Array:
          case (CBORObjectType_SimpleValue << 4) | CBORObjectType_Map:
          case (CBORObjectType_ByteString << 4) | CBORObjectType_TextString:
          case (CBORObjectType_ByteString << 4) | CBORObjectType_Array:
          case (CBORObjectType_ByteString << 4) | CBORObjectType_Map:
          case (CBORObjectType_TextString << 4) | CBORObjectType_Array:
          case (CBORObjectType_TextString << 4) | CBORObjectType_Map:
          case (CBORObjectType_Array << 4) | CBORObjectType_Map:
            return -1;
          case (CBORObjectType_SimpleValue << 4) | CBORObjectType_Integer:
          case (CBORObjectType_SimpleValue << 4) | CBORObjectType_BigInteger:
          case (CBORObjectType_SimpleValue << 4) | CBORObjectType_Single:
          case (CBORObjectType_SimpleValue << 4) | CBORObjectType_Double:
          case (CBORObjectType_SimpleValue << 4) | CBORObjectType_ExtendedDecimal:
          case (CBORObjectType_ByteString << 4) | CBORObjectType_Integer:
          case (CBORObjectType_ByteString << 4) | CBORObjectType_BigInteger:
          case (CBORObjectType_ByteString << 4) | CBORObjectType_Single:
          case (CBORObjectType_ByteString << 4) | CBORObjectType_Double:
          case (CBORObjectType_ByteString << 4) | CBORObjectType_ExtendedDecimal:
          case (CBORObjectType_ByteString << 4) | CBORObjectType_SimpleValue:
          case (CBORObjectType_TextString << 4) | CBORObjectType_Integer:
          case (CBORObjectType_TextString << 4) | CBORObjectType_BigInteger:
          case (CBORObjectType_TextString << 4) | CBORObjectType_Single:
          case (CBORObjectType_TextString << 4) | CBORObjectType_Double:
          case (CBORObjectType_TextString << 4) | CBORObjectType_ExtendedDecimal:
          case (CBORObjectType_TextString << 4) | CBORObjectType_SimpleValue:
          case (CBORObjectType_TextString << 4) | CBORObjectType_ByteString:
          case (CBORObjectType_Array << 4) | CBORObjectType_Integer:
          case (CBORObjectType_Array << 4) | CBORObjectType_BigInteger:
          case (CBORObjectType_Array << 4) | CBORObjectType_Single:
          case (CBORObjectType_Array << 4) | CBORObjectType_Double:
          case (CBORObjectType_Array << 4) | CBORObjectType_ExtendedDecimal:
          case (CBORObjectType_Array << 4) | CBORObjectType_SimpleValue:
          case (CBORObjectType_Array << 4) | CBORObjectType_ByteString:
          case (CBORObjectType_Array << 4) | CBORObjectType_TextString:
          case (CBORObjectType_Map << 4) | CBORObjectType_Integer:
          case (CBORObjectType_Map << 4) | CBORObjectType_BigInteger:
          case (CBORObjectType_Map << 4) | CBORObjectType_Single:
          case (CBORObjectType_Map << 4) | CBORObjectType_Double:
          case (CBORObjectType_Map << 4) | CBORObjectType_ExtendedDecimal:
          case (CBORObjectType_Map << 4) | CBORObjectType_SimpleValue:
          case (CBORObjectType_Map << 4) | CBORObjectType_ByteString:
          case (CBORObjectType_Map << 4) | CBORObjectType_TextString:
          case (CBORObjectType_Map << 4) | CBORObjectType_Array:
            return 1;
          default:
            throw new IllegalArgumentException("Unexpected data type");
        }
      }
    }

    private static int ListCompare(ArrayList<CBORObject> listA, ArrayList<CBORObject> listB) {
      if (listA == null) return (listB == null) ? 0 : -1;
      if (listB == null) return 1;
      int listACount = listA.size();
      int listBCount = listB.size();
      int c = Math.min(listACount, listBCount);
      for (int i = 0; i < c; i++) {
        int cmp = listA.get(i).compareTo(listB.get(i));
        if (cmp != 0) return cmp;
      }
      if (listACount != listBCount)
        return (listACount < listBCount) ? -1 : 1;
      return 0;
    }
    private static boolean CBORArrayEquals(
      List<CBORObject> listA,
      List<CBORObject> listB
     ) {
      if (listA == null) return (listB == null);
      if (listB == null) return false;
      int listACount = listA.size();
      int listBCount = listB.size();
      if (listACount != listBCount) return false;
      for (int i = 0; i < listACount; i++) {
        CBORObject itemA = listA.get(i);
        CBORObject itemB = listB.get(i);
        if (!(itemA == null ? itemB == null : itemA.equals(itemB)))
          return false;
      }
      return true;
    }
    private static int CBORArrayHashCode(List<CBORObject> list) {
      if (list == null) return 0;
      int ret = 19;
      int count = list.size();
      {
        ret = ret * 31 + count;
        for (int i = 0; i < count; i++) {
          ret = ret * 31 + list.get(i).hashCode();
        }
      }
      return ret;
    }
    private static boolean CBORMapEquals(
      Map<CBORObject, CBORObject> mapA,
      Map<CBORObject, CBORObject> mapB
     ) {
      if (mapA == null) return (mapB == null);
      if (mapB == null) return false;
      if (mapA.size() != mapB.size()) return false;
      for(Map.Entry<CBORObject, CBORObject> kvp : mapA.entrySet()) {
        CBORObject valueB = null;
        boolean hasKey;
valueB=mapB.get(kvp.getKey());
hasKey=(valueB==null) ? mapB.containsKey(kvp.getKey()) : true;
        if (hasKey) {
          CBORObject valueA = kvp.getValue();
          if (!(valueA == null ? valueB == null : valueA.equals(valueB)))
            return false;
        } else {
          return false;
        }
      }
      return true;
    }
    private static int CBORMapHashCode(Map<CBORObject, CBORObject> a) {
      // To simplify matters, we use just the count of
      // the map as the basis for the hash code.  More complicated
      // hash code calculation would generally involve defining
      // how CBORObjects ought to be compared (since a stable
      // sort order is necessary for two equal maps to have the
      // same hash code), which is much too difficult to do.
      return (a.size() * 19);
    }
    /**
     * Determines whether this object and another object are equal.
     * @param obj An arbitrary object.
     * @return True if the objects are equal; false otherwise.
     */
    @Override public boolean equals(Object obj) {
      return equals(((obj instanceof CBORObject) ? (CBORObject)obj : null));
    }
    /**
     * Compares the equality of two CBOR objects.
     * @param other The object to compare
     * @return true if the objects are equal; otherwise, false.
     */
    @SuppressWarnings("unchecked")
public boolean equals(CBORObject other) {
      CBORObject otherValue = ((other instanceof CBORObject) ? (CBORObject)other : null);
      if (otherValue == null)
        return false;
      switch (this.itemtype_) {
        case CBORObjectType_ByteString:
          if (!CBORUtilities.ByteArrayEquals((byte[])this.getThisItem(), ((otherValue.item_ instanceof byte[]) ? (byte[])otherValue.item_ : null)))
            return false;
          break;
        case CBORObjectType_Map:
          if (!CBORMapEquals(AsMap(),
                             ((otherValue.item_ instanceof Map<?,?>) ? (Map<CBORObject, CBORObject>)otherValue.item_ : null)))
            return false;
          break;
        case CBORObjectType_Array:
          if (!CBORArrayEquals(AsList(), ((otherValue.item_ instanceof List<?>) ? (List<CBORObject>)otherValue.item_ : null)))
            return false;
          break;
        default:
          if (!(((this.item_)==null) ? ((otherValue.item_)==null) : (this.item_).equals(otherValue.item_)))
            return false;
          break;
      }
      return this.itemtype_ == otherValue.itemtype_ &&
        this.tagLow == otherValue.tagLow &&
        this.tagHigh == otherValue.tagHigh;
    }
    /**
     * Calculates the hash code of this object.
     * @return A 32-bit hash code.
     */
    @Override public int hashCode() {
      int hashCode_ = 13;
      {
        if (item_ != null) {
          int itemHashCode = 0;
          switch (this.itemtype_) {
            case CBORObjectType_ByteString:
              itemHashCode = CBORUtilities.ByteArrayHashCode((byte[])this.getThisItem());
              break;
            case CBORObjectType_Map:
              itemHashCode = CBORMapHashCode(AsMap());
              break;
            case CBORObjectType_Array:
              itemHashCode = CBORArrayHashCode(AsList());
              break;
            default:
              itemHashCode = item_.hashCode();
              break;
          }
          hashCode_ += 17 * itemHashCode;
        }
        hashCode_ += 19 * (this.itemtype_ + this.tagLow + this.tagHigh);
      }
      return hashCode_;
    }

    private static void CheckCBORLength(long expectedLength, long actualLength) {
      if (actualLength < expectedLength)
        throw new CBORException("Premature end of data");
      else if (actualLength > expectedLength)
        throw new CBORException("Too many bytes");
    }
    private static void CheckCBORLength(int expectedLength, int actualLength) {
      if (actualLength < expectedLength)
        throw new CBORException("Premature end of data");
      else if (actualLength > expectedLength)
        throw new CBORException("Too many bytes");
    }
    private static String GetOptimizedStringIfShortAscii(
      byte[] data, int offset
     ) {
      int length = data.length;
      if (length > offset) {
        int nextbyte = ((int)(data[offset] & (int)0xFF));
        if (nextbyte >= 0x60 && nextbyte < 0x78) {
          int offsetp1 = 1 + offset;
          // Check for type 3 String of short length
          int rightLength = offsetp1 + (nextbyte - 0x60);
          CheckCBORLength(rightLength, length);
          // Check for all ASCII text
          for (int i = offsetp1; i < length; i++) {
            if ((data[i] & ((byte)0x80)) != 0) {
              return null;
            }
          }
          // All ASCII text, so convert to a String
          // from a char array without having to
          // convert from UTF-8 first
          char[] c = new char[length - offsetp1];
          for (int i = offsetp1; i < length; i++) {
            c[i - offsetp1] = ((char)(data[i] & (int)0xFF));
          }
          return new String(c);
        }
      }
      return null;
    }
    private static CBORObject[] FixedObjects = InitializeFixedObjects();
    // Initialize fixed values for certain
    // head bytes
    private static CBORObject[] InitializeFixedObjects() {
      FixedObjects = new CBORObject[256];
      for (int i = 0; i < 0x18; i++) {
        FixedObjects[i] = new CBORObject(CBORObjectType_Integer, (long)i);
      }
      for (int i = 0x20; i < 0x38; i++) {
        FixedObjects[i] = new CBORObject(CBORObjectType_Integer,
                                         (long)(-1 - (i - 0x20)));
      }
      FixedObjects[0x60] = new CBORObject(CBORObjectType_TextString, "");
      for (int i = 0xE0; i < 0xf8; i++) {
        FixedObjects[i] = new CBORObject(CBORObjectType_SimpleValue, (int)(i - 0xe0));
      }
      return FixedObjects;
    }
    // Expected lengths for each head byte.
    // 0 means length varies. -1 means invalid.
    private static int[] ExpectedLengths = new int[]{
      1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, // major type 0
      1,1,1,1,1,1,1,1, 2,3,5,9,-1,-1,-1,-1,
      1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, // major type 1
      1,1,1,1,1,1,1,1, 2,3,5,9,-1,-1,-1,-1,
      1,2,3,4,5,6,7,8, 9,10,11,12,13,14,15,16, // major type 2
      17,18,19,20,21,22,23,24,  0,0,0,0,-1,-1,-1,0,
      1,2,3,4,5,6,7,8, 9,10,11,12,13,14,15,16, // major type 3
      17,18,19,20,21,22,23,24,  0,0,0,0,-1,-1,-1,0,
      1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, // major type 4
      0,0,0,0,0,0,0,0, 0,0,0,0,-1,-1,-1,0,
      1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, // major type 5
      0,0,0,0,0,0,0,0, 0,0,0,0,-1,-1,-1,0,
      0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, // major type 6
      0,0,0,0,0,0,0,0, 0,0,0,0,-1,-1,-1,-1,
      1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, // major type 7
      1,1,1,1,1,1,1,1, 2,3,5,9,-1,-1,-1,-1
    };
    // Generate a CBOR Object for head bytes with fixed length.
    // Note that this function assumes that the length of the data
    // was already checked.
    private static CBORObject GetFixedLengthObject(int firstbyte, byte[] data) {
      CBORObject fixedObj = FixedObjects[firstbyte];
      if (fixedObj != null)
        return fixedObj;
      int majortype = (firstbyte >> 5);
      if (firstbyte >= 0x61 && firstbyte < 0x78) {
        // text String length 1 to 23
        String s = GetOptimizedStringIfShortAscii(data, 0);
        if (s != null) return new CBORObject(CBORObjectType_TextString, s);
      }
      if (((firstbyte & 0x1C) == 0x18)) {
        // contains 1 to 8 extra bytes of additional information
        long uadditional = 0;
        switch (firstbyte & 0x1F) {
          case 24:
            uadditional = ((int)(data[1] & (int)0xFF));
            break;
          case 25:
            uadditional = (((long)(data[1] & (long)0xFF)) << 8);
            uadditional |= (((long)(data[2] & (long)0xFF)));
            break;
          case 26:
            uadditional = (((long)(data[1] & (long)0xFF)) << 24);
            uadditional |= (((long)(data[2] & (long)0xFF)) << 16);
            uadditional |= (((long)(data[3] & (long)0xFF)) << 8);
            uadditional |= (((long)(data[4] & (long)0xFF)));
            break;
          case 27:
            uadditional = (((long)(data[1] & (long)0xFF)) << 56);
            uadditional |= (((long)(data[2] & (long)0xFF)) << 48);
            uadditional |= (((long)(data[3] & (long)0xFF)) << 40);
            uadditional |= (((long)(data[4] & (long)0xFF)) << 32);
            uadditional |= (((long)(data[5] & (long)0xFF)) << 24);
            uadditional |= (((long)(data[6] & (long)0xFF)) << 16);
            uadditional |= (((long)(data[7] & (long)0xFF)) << 8);
            uadditional |= (((long)(data[8] & (long)0xFF)));
            break;
          default:
            throw new CBORException("Unexpected data encountered");
        }
        switch (majortype) {
          case 0:
            if ((uadditional >> 63) == 0) {
              // use only if additional's top bit isn't set
              // (additional is a signed long)
              return new CBORObject(CBORObjectType_Integer, uadditional);
            } else {
              int low=((int)((uadditional)&0xFFFFFFFFL));
              int high=((int)((uadditional>>32)&0xFFFFFFFFL));
              return FromObject(LowHighToBigInteger(low,high));
            }
          case 1:
            if ((uadditional >> 63) == 0) {
              // use only if additional's top bit isn't set
              // (additional is a signed long)
              return new CBORObject(CBORObjectType_Integer, -1 - uadditional);
            } else {
              int low=((int)((uadditional)&0xFFFFFFFFL));
              int high=((int)((uadditional>>32)&0xFFFFFFFFL));
              BigInteger bigintAdditional=LowHighToBigInteger(low,high);
              bigintAdditional =(BigInteger.ONE).negate();
              bigintAdditional=bigintAdditional.subtract(bigintAdditional);
              return FromObject(bigintAdditional);
            }
          case 7:
            if (firstbyte == 0xf9)
              return new CBORObject(
                CBORObjectType_Single, CBORUtilities.HalfPrecisionToSingle(
                  ((int)uadditional)));
            else if (firstbyte == 0xfa)
              return new CBORObject(
                CBORObjectType_Single,
                Float.intBitsToFloat(((int)uadditional)));
            else if (firstbyte == 0xfb)
              return new CBORObject(
                CBORObjectType_Double,
                Double.longBitsToDouble(uadditional));
            else if (firstbyte == 0xf8)
              return new CBORObject(
                CBORObjectType_SimpleValue, (int)uadditional);
            else
              throw new CBORException("Unexpected data encountered");
          default:
            throw new CBORException("Unexpected data encountered");
        }
      } else if (majortype == 2) { // short byte String
        byte[] ret = new byte[firstbyte - 0x40];
        System.arraycopy(data, 1, ret, 0, firstbyte - 0x40);
        return new CBORObject(CBORObjectType_ByteString, ret);
      } else if (majortype == 3) { // short text String
        StringBuilder ret = new StringBuilder(firstbyte - 0x60);
        DataUtilities.ReadUtf8FromBytes(data, 1, firstbyte - 0x60, ret, false);
        return new CBORObject(CBORObjectType_TextString, ret.toString());
      } else if (firstbyte == 0x80) // empty array
        return FromObject(new ArrayList<CBORObject>());
      else if (firstbyte == 0xA0) // empty map
        return FromObject(new HashMap<CBORObject, CBORObject>());
      else
        throw new CBORException("Unexpected data encountered");
    }
    /**
     * Generates a CBOR object from an array of CBOR-encoded bytes.
     * @param data A byte[] object.
     * @return A CBOR object corresponding to the data.
     * @throws java.lang.IllegalArgumentException data is null or empty.
     * @throws CBORException There was an error in reading or parsing the
     * data.
     */
    public static CBORObject DecodeFromBytes(byte[] data) {
      if ((data) == null) throw new NullPointerException("data");
      if ((data).length == 0) throw new IllegalArgumentException("data is empty.");
      int firstbyte = ((int)(data[0] & (int)0xFF));
      int expectedLength = ExpectedLengths[firstbyte];
      if (expectedLength == -1) // if invalid
        throw new CBORException("Unexpected data encountered");
      else if (expectedLength != 0) // if fixed length
        CheckCBORLength(expectedLength, data.length);
      if (firstbyte == 0xc0) {
        // value with tag 0
        String s = GetOptimizedStringIfShortAscii(data, 1);
        if (s != null) return new CBORObject(FromObject(s), 0, 0);
      }
      if (expectedLength != 0) {
        return GetFixedLengthObject(firstbyte, data);
      }
      // For objects with variable length,
      // read the Object as though
      // the byte array were a stream
      java.io.ByteArrayInputStream ms=null;
try {
ms=new ByteArrayInputStream(data);
int startingAvailable=ms.available();

        CBORObject o = Read(ms);
        CheckCBORLength((long)data.length, (long)(startingAvailable-ms.available()));
        return o;
}
finally {
try { if(ms!=null)ms.close(); } catch(IOException ex){}
}
    }
    /**
     * Gets the number of keys in this map, or the number of items in this array,
     * or 0 if this item is neither an array nor a map.
     */
    public int size() {
        if (this.getItemType() == CBORObjectType_Array) {
          return (AsList()).size();
        } else if (this.getItemType() == CBORObjectType_Map) {
          return (AsMap()).size();
        } else {
          return 0;
        }
      }
    /**
     * Gets whether this data item has at least one tag.
     */
    public boolean isTagged() {
        return this.itemtype_ == CBORObjectType_Tagged;
      }
    /**
     * Gets the byte array used in this object, if this object is a byte string.
     * @return A byte[] object.
     * @throws IllegalStateException This object is not a byte string.
     */
    public byte[] GetByteString() {
      if (this.itemtype_ == CBORObjectType_ByteString)
        return ((byte[])this.getThisItem());
      else
        throw new IllegalStateException("Not a byte String");
    }
    private boolean HasTag(int tagValue) {
      if (!this.isTagged()) return false;
      if (tagHigh == 0 && tagValue == tagLow) return true;
      return ((CBORObject)item_).HasTag(tagValue);
    }
    private static BigInteger LowHighToBigInteger(int tagLow, int tagHigh) {
      byte[] uabytes=null;
      if (tagHigh != 0) {
        uabytes=new byte[9];
        uabytes[7]=(byte)((tagHigh>>24)&0xFF);
        uabytes[6]=(byte)((tagHigh>>16)&0xFF);
        uabytes[5]=(byte)((tagHigh>>8)&0xFF);
        uabytes[4]=(byte)((tagHigh)&0xFF);
        uabytes[3]=(byte)((tagLow>>24)&0xFF);
        uabytes[2]=(byte)((tagLow>>16)&0xFF);
        uabytes[1]=(byte)((tagLow>>8)&0xFF);
        uabytes[0]=(byte)((tagLow)&0xFF);
        uabytes[8]=0;
        return BigInteger.fromByteArray((byte[])uabytes,true);
      } else if(tagLow!=0){
        uabytes=new byte[5];
        uabytes[3]=(byte)((tagLow>>24)&0xFF);
        uabytes[2]=(byte)((tagLow>>16)&0xFF);
        uabytes[1]=(byte)((tagLow>>8)&0xFF);
        uabytes[0]=(byte)((tagLow)&0xFF);
        uabytes[4]=0;
        return BigInteger.fromByteArray((byte[])uabytes,true);
      } else {
        return BigInteger.ZERO;
      }
    }
    private static BigInteger[] EmptyTags = new BigInteger[0];
    /**
     * Gets a list of all tags, from outermost to innermost.
     * @return A BigInteger[] object.
     */
    public BigInteger[] GetTags() {
      if (!this.isTagged()) return EmptyTags;
      CBORObject curitem = this;
      if (curitem.isTagged()) {
        ArrayList<BigInteger> list=new ArrayList<BigInteger>();
        while (curitem.isTagged()) {
          list.add(LowHighToBigInteger(
            curitem.tagLow, curitem.tagHigh));
          curitem = ((CBORObject)curitem.item_);
        }
        return list.toArray(new BigInteger[]{});
      } else {
        return new BigInteger[] { LowHighToBigInteger(tagLow, tagHigh) };
      }
    }
    /**
     * Gets the last defined tag for this CBOR data item, or 0 if the item is
     * untagged.
     */
    public BigInteger getInnermostTag() {
        if (!this.isTagged()) return BigInteger.ZERO;
        CBORObject previtem = this;
        CBORObject curitem = ((CBORObject)item_);
        while (curitem.isTagged()) {
          previtem = curitem;
          curitem = ((CBORObject)curitem.item_);
        }
        if (previtem.tagHigh == 0 &&
            previtem.tagLow >= 0 &&
            previtem.tagLow < 0x10000) {
          return BigInteger.valueOf(previtem.tagLow);
        }
        return LowHighToBigInteger(
          previtem.tagLow,
          previtem.tagHigh);
      }
    @SuppressWarnings("unchecked")
private Map<CBORObject, CBORObject> AsMap() {
      return (Map<CBORObject, CBORObject>)this.getThisItem();
    }
    @SuppressWarnings("unchecked")
private List<CBORObject> AsList() {
      return (List<CBORObject>)this.getThisItem();
    }
    /**
     * Gets the value of a CBOR object by integer index in this array.
     * @throws java.lang.IllegalStateException This object is not an
     * array.
     */
    public CBORObject get(int index) {
        if (this.getItemType() == CBORObjectType_Array) {
          List<CBORObject> list = AsList();
          return list.get(index);
        } else {
          throw new IllegalStateException("Not an array");
        }
      }
    /**
     * Sets the value of a CBOR object by integer index in this array.
     * @throws java.lang.IllegalStateException This object is not an
     * array.
     * @throws java.lang.NullPointerException value is null (as opposed
     * to CBORObject.Null).
     */
public void set(int index, CBORObject value) {
        if (this.getItemType() == CBORObjectType_Array) {
          if ((value) == null) throw new NullPointerException("value");
          List<CBORObject> list = AsList();
          list.set(index,value);
        } else {
          throw new IllegalStateException("Not an array");
        }
      }
    /**
     * Gets a collection of the keys of this CBOR object.
     * @throws java.lang.IllegalStateException This object is not a map.
     */
    public Collection<CBORObject> getKeys() {
        if (this.getItemType() == CBORObjectType_Map) {
          Map<CBORObject, CBORObject> dict = AsMap();
          return dict.keySet();
        } else {
          throw new IllegalStateException("Not a map");
        }
      }
    /**
     * Gets the value of a CBOR object in this map, using a CBOR object as the
     * key.
     * @throws java.lang.NullPointerException The key is null (as opposed
     * to CBORObject.Null).
     * @throws java.lang.IllegalStateException This object is not a map.
     */
    public CBORObject get(CBORObject key) {
        if ((key) == null) throw new NullPointerException("key");
        if (this.getItemType() == CBORObjectType_Map) {
          Map<CBORObject, CBORObject> map = AsMap();
          if (!map.containsKey(key))
            return null;
          return map.get(key);
        } else {
          throw new IllegalStateException("Not a map");
        }
      }
    /**
     * Sets the value of a CBOR object in this map, using a CBOR object as the
     * key.
     * @throws java.lang.NullPointerException The key or value is null (as
     * opposed to CBORObject.Null).
     * @throws java.lang.IllegalStateException This object is not a map.
     */
public void set(CBORObject key, CBORObject value) {
        if ((key) == null) throw new NullPointerException("key");
        if ((value) == null) throw new NullPointerException("value");
        if (this.getItemType() == CBORObjectType_Map) {
          Map<CBORObject, CBORObject> map = AsMap();
          map.put(key,value);
        } else {
          throw new IllegalStateException("Not a map");
        }
      }
    /**
     * Gets the value of a CBOR object in this map, using a string as the key.
     * @throws java.lang.NullPointerException The key is null.
     * @throws java.lang.IllegalStateException This object is not a map.
     */
    public CBORObject get(String key) {
        if ((key) == null) throw new NullPointerException("key");
        CBORObject objkey = CBORObject.FromObject(key);
        return this.get(objkey);
      }
    /**
     * Sets the value of a CBOR object in this map, using a string as the key.
     * @throws java.lang.NullPointerException The key or value is null (as
     * opposed to CBORObject.Null).
     * @throws java.lang.IllegalStateException This object is not a map.
     */
public void set(String key, CBORObject value) {
        if ((key) == null) throw new NullPointerException("key");
        if ((value) == null) throw new NullPointerException("value");
        CBORObject objkey = CBORObject.FromObject(key);
        if (this.getItemType() == CBORObjectType_Map) {
          Map<CBORObject, CBORObject> map = AsMap();
          map.put(objkey,value);
        } else {
          throw new IllegalStateException("Not a map");
        }
      }
    /**
     * Returns the simple value ID of this object, or -1 if this object is not
     * a simple value (including if the value is a floating-point number).
     */
    public int getSimpleValue() {
        if (this.getItemType() == CBORObjectType_SimpleValue) {
          return ((Integer)this.getThisItem()).intValue();
        } else {
          return -1;
        }
      }
    /**
     * Adds a new object to this map.
     * @param key A CBOR object representing the key.
     * @param value A CBOR object representing the value.
     * @return The sum of the two objects.
     * @throws java.lang.NullPointerException key or value is null (as opposed
     * to CBORObject.Null).
     * @throws java.lang.IllegalArgumentException key already exists in this map.
     * @throws IllegalStateException This object is not a map.
     */
    public void Add(CBORObject key, CBORObject value) {
      if ((key) == null) throw new NullPointerException("key");
      if ((value) == null) throw new NullPointerException("value");
      if (this.getItemType() == CBORObjectType_Map) {
        Map<CBORObject, CBORObject> map = AsMap();
        if (map.containsKey(key))
          throw new IllegalArgumentException("Key already exists.");
        map.put(key, value);
      } else {
        throw new IllegalStateException("Not a map");
      }
    }
    /**
     * Adds a new object to this map.
     * @param key A string representing the key.
     * @param value A CBOR object representing the value.
     * @return The sum of the two objects.
     * @throws java.lang.NullPointerException key or value is null (as opposed
     * to CBORObject.Null).
     * @throws java.lang.IllegalArgumentException key already exists in this map.
     * @throws IllegalStateException This object is not a map.
     */
    public void Add(String key, CBORObject value) {
      if ((key) == null) throw new NullPointerException("key");
      if ((value) == null) throw new NullPointerException("value");
      Add(CBORObject.FromObject(key), value);
    }
    /**
     * Determines whether a value of the given key exists in this object.
     * @param key An object that serves as the key.
     * @return True if the given key is found, or false if the given key is not
     * found or this object is not a map.
     * @throws java.lang.NullPointerException key is null (as opposed to
     * CBORObject.Null).
     */
    public boolean ContainsKey(CBORObject key) {
      if ((key) == null) throw new NullPointerException("key");
      if (this.getItemType() == CBORObjectType_Map) {
        Map<CBORObject, CBORObject> map = AsMap();
        return map.containsKey(key);
      } else {
        return false;
      }
    }
    /**
     * Adds a new object to the end of this array.
     * @param obj A CBOR object.
     * @throws java.lang.IllegalStateException This object is not an
     * array.
     * @throws java.lang.NullPointerException obj is null (as opposed to
     * CBORObject.Null).
     */
    public void Add(CBORObject obj) {
      if ((obj) == null) throw new NullPointerException("obj");
      if (this.getItemType() == CBORObjectType_Array) {
        List<CBORObject> list = AsList();
        list.add(obj);
      } else {
        throw new IllegalStateException("Not an array");
      }
    }
    /**
     * If this object is an array, removes the first instance of the specified
     * item from the array. If this object is a map, removes the item with the
     * given key from the map.
     * @param obj The item or key to remove.
     * @return True if the item was removed; otherwise, false.
     * @throws java.lang.NullPointerException obj is null (as opposed to
     * CBORObject.Null).
     * @throws java.lang.IllegalStateException The object is not an array
     * or map.
     */
    public boolean Remove(CBORObject obj) {
      if ((obj) == null) throw new NullPointerException("obj");
      if (this.getItemType() == CBORObjectType_Map) {
        Map<CBORObject, CBORObject> dict = AsMap();
        boolean hasKey = dict.containsKey(obj);
        if (hasKey) {
          dict.remove(obj);
          return true;
        }
        return false;
      } else if (this.getItemType() == CBORObjectType_Array) {
        List<CBORObject> list = AsList();
        return list.remove(obj);
      } else {
        throw new IllegalStateException("Not a map or array");
      }
    }
    /**
     * Converts this object to a 64-bit floating point number.
     * @return The closest 64-bit floating point number to this object.
     * The return value can be positive infinity or negative infinity if
     * this value exceeds the range of a 64-bit floating point number.
     * @throws java.lang.IllegalStateException This object's type is
     * not a number type.
     */
    public double AsDouble() {
      int type = this.getItemType();
      switch (type) {
        case CBORObjectType_Integer:
          return ((Long)this.getThisItem()).doubleValue();
        case CBORObjectType_BigInteger:
          return ExtendedFloat.FromBigInteger((BigInteger)this.getThisItem()).ToDouble();
        case CBORObjectType_Single:
          return ((Float)this.getThisItem()).doubleValue();
        case CBORObjectType_Double:
          return ((Double)this.getThisItem()).doubleValue();
          case CBORObjectType_ExtendedDecimal: {
            return ((ExtendedDecimal)this.getThisItem()).ToDouble();
          }
          case CBORObjectType_ExtendedFloat: {
            return ((ExtendedFloat)this.getThisItem()).ToDouble();
          }
        default:
          throw new IllegalStateException("Not a number type");
      }
    }
    /**
     * Converts this object to a decimal fraction.
     * @return A decimal fraction for this object&apos;s value.
     * @throws java.lang.IllegalStateException This object's type is
     * not a number type.
     */
    public ExtendedDecimal AsExtendedDecimal() {
      int type = this.getItemType();
      switch (type) {
        case CBORObjectType_Integer:
          return ExtendedDecimal.FromInt64((((Long)this.getThisItem()).longValue()));
        case CBORObjectType_BigInteger:
          return ExtendedDecimal.FromBigInteger((BigInteger)this.getThisItem());
        case CBORObjectType_Single:
          return ExtendedDecimal.FromSingle(((Float)this.getThisItem()).floatValue());
        case CBORObjectType_Double:
          return ExtendedDecimal.FromDouble(((Double)this.getThisItem()).doubleValue());
        case CBORObjectType_ExtendedDecimal:
          return (ExtendedDecimal)this.getThisItem();
          case CBORObjectType_ExtendedFloat: {
            return ExtendedDecimal.FromExtendedFloat((ExtendedFloat)this.getThisItem());
          }
        default:
          throw new IllegalStateException("Not a number type");
      }
    }
    /**
     * Converts this object to an arbitrary-precision binary floating
     * point number.
     * @return An arbitrary-precision binary floating point number for
     * this object&apos;s value. Note that if this object is a decimal fraction
     * with a fractional part, the conversion may lose information depending
     * on the number.
     * @throws java.lang.IllegalStateException This object's type is
     * not a number type.
     */
    public ExtendedFloat AsExtendedFloat() {
      int type = this.getItemType();
      switch (type) {
        case CBORObjectType_Integer:
          return ExtendedFloat.FromInt64((((Long)this.getThisItem()).longValue()));
        case CBORObjectType_BigInteger:
          return ExtendedFloat.FromBigInteger((BigInteger)this.getThisItem());
        case CBORObjectType_Single:
          return ExtendedFloat.FromSingle(((Float)this.getThisItem()).floatValue());
        case CBORObjectType_Double:
          return ExtendedFloat.FromDouble(((Double)this.getThisItem()).doubleValue());
        case CBORObjectType_ExtendedDecimal:
          return ((ExtendedDecimal)this.getThisItem()).ToExtendedFloat();
          case CBORObjectType_ExtendedFloat: {
            return (ExtendedFloat)this.getThisItem();
          }
        default:
          throw new IllegalStateException("Not a number type");
      }
    }
    /**
     * Converts this object to a 32-bit floating point number.
     * @return The closest 32-bit floating point number to this object.
     * The return value can be positive infinity or negative infinity if
     * this object&apos;s value exceeds the range of a 32-bit floating point
     * number.
     * @throws java.lang.IllegalStateException This object's type is
     * not a number type.
     */
    public float AsSingle() {
      int type = this.getItemType();
      switch (type) {
        case CBORObjectType_Integer:
          return ((Long)this.getThisItem()).floatValue();
        case CBORObjectType_BigInteger:
          return ExtendedFloat.FromBigInteger((BigInteger)this.getThisItem()).ToSingle();
        case CBORObjectType_Single:
          return ((Float)this.getThisItem()).floatValue();
        case CBORObjectType_Double:
          return ((Double)this.getThisItem()).floatValue();
          case CBORObjectType_ExtendedDecimal: {
            return ((ExtendedDecimal)this.getThisItem()).ToSingle();
          }
          case CBORObjectType_ExtendedFloat: {
            return ((ExtendedFloat)this.getThisItem()).ToSingle();
          }
        default:
          throw new IllegalStateException("Not a number type");
      }
    }
    /**
     * Converts this object to an arbitrary-precision integer. Fractional
     * values are truncated to an integer.
     * @return The closest big integer to this object.
     * @throws java.lang.IllegalStateException This object's type is
     * not a number type.
     */
    public BigInteger AsBigInteger() {
      int type = this.getItemType();
      switch (type) {
        case CBORObjectType_Integer:
          return BigInteger.valueOf((((Long)this.getThisItem()).longValue()));
        case CBORObjectType_BigInteger:
          return (BigInteger)this.getThisItem();
        case CBORObjectType_Single:
          return CBORUtilities.BigIntegerFromSingle(((Float)this.getThisItem()).floatValue());
        case CBORObjectType_Double:
          return CBORUtilities.BigIntegerFromDouble(((Double)this.getThisItem()).doubleValue());
          case CBORObjectType_ExtendedDecimal: {
            return ((ExtendedDecimal)this.getThisItem()).ToBigInteger();
          }
          case CBORObjectType_ExtendedFloat: {
            return ((ExtendedFloat)this.getThisItem()).ToBigInteger();
          }
        default:
          throw new IllegalStateException("Not a number type");
      }
    }
    /**
     * Returns false if this object is False, Null, or Undefined; otherwise,
     * true.
     * @return A Boolean object.
     */
    public boolean AsBoolean() {
      if (this.isFalse() || this.isNull() || this.isUndefined())
        return false;
      return true;
    }
    /**
     * Converts this object to a 16-bit signed integer. Floating point values
     * are truncated to an integer.
     * @return The closest 16-bit signed integer to this object.
     * @throws java.lang.IllegalStateException This object's type is
     * not a number type.
     * @throws java.lang.ArithmeticException This object's value exceeds
     * the range of a 16-bit signed integer.
     */
    public short AsInt16() {
      return (short)AsInt32(Short.MIN_VALUE, Short.MAX_VALUE);
    }
    /**
     * Converts this object to a byte (0 to 255). Floating point values are
     * truncated to an integer.
     * @return The closest byte-sized integer to this object.
     * @throws java.lang.IllegalStateException This object's type is
     * not a number type.
     * @throws java.lang.ArithmeticException This object's value exceeds
     * the range of a byte (is less than 0 or would be greater than 255 when truncated
     * to an integer).
     */
    public byte AsByte() {
      return (byte)AsInt32(0, 255);
    }
    /**
     * Converts this object to a 64-bit signed integer. Floating point values
     * are truncated to an integer.
     * @return The closest 64-bit signed integer to this object.
     * @throws java.lang.IllegalStateException This object's type is
     * not a number type.
     * @throws java.lang.ArithmeticException This object's value exceeds
     * the range of a 64-bit signed integer.
     */
    public long AsInt64() {
      int type = this.getItemType();
      switch (type) {
          case CBORObjectType_Integer: {
            return (((Long)this.getThisItem()).longValue());
          }
          case CBORObjectType_BigInteger: {
            if (((BigInteger)this.getThisItem()).compareTo(Int64MaxValue) > 0 ||
                ((BigInteger)this.getThisItem()).compareTo(Int64MinValue) < 0)
              throw new ArithmeticException("This Object's value is out of range");
            return ((BigInteger)this.getThisItem()).longValue();
          }
          case CBORObjectType_Single: {
            float fltItem = ((Float)this.getThisItem()).floatValue();
            if (Float.isNaN(fltItem))
              throw new ArithmeticException("This Object's value is out of range");
            fltItem = (fltItem < 0) ? (float)Math.ceil(fltItem) : (float)Math.floor(fltItem);
            if (fltItem >= Long.MIN_VALUE && fltItem <= Long.MAX_VALUE)
              return (long)fltItem;
            throw new ArithmeticException("This Object's value is out of range");
          }
          case CBORObjectType_Double: {
            double fltItem = ((Double)this.getThisItem()).doubleValue();
            if (Double.isNaN(fltItem))
              throw new ArithmeticException("This Object's value is out of range");
            fltItem = (fltItem < 0) ? Math.ceil(fltItem) : Math.floor(fltItem);
            if (fltItem >= Long.MIN_VALUE && fltItem <= Long.MAX_VALUE)
              return (long)fltItem;
            throw new ArithmeticException("This Object's value is out of range");
          }
          case CBORObjectType_ExtendedDecimal: {
            BigInteger bi = ((ExtendedDecimal)this.getThisItem()).ToBigInteger();
            if (bi.compareTo(Int64MaxValue) > 0 ||
                bi.compareTo(Int64MinValue) < 0)
              throw new ArithmeticException("This Object's value is out of range");
            return bi.longValue();
          }
          case CBORObjectType_ExtendedFloat: {
            BigInteger bi = ((ExtendedFloat)this.getThisItem()).ToBigInteger();
            if (bi.compareTo(Int64MaxValue) > 0 ||
                bi.compareTo(Int64MinValue) < 0)
              throw new ArithmeticException("This Object's value is out of range");
            return bi.longValue();
          }
        default:
          throw new IllegalStateException("Not a number type");
      }
    }
    private int AsInt32(int minValue, int maxValue) {
      Object thisItem = this.getThisItem();
      int type = this.getItemType();
      switch (type) {
          case CBORObjectType_Integer: {
            long longItem = (((Long)thisItem).longValue());
            if (longItem > maxValue || longItem < minValue)
              throw new ArithmeticException("This Object's value is out of range");
            return (int)longItem;
          }
          case CBORObjectType_BigInteger: {
            BigInteger bigintItem=(BigInteger)thisItem;
            if (bigintItem.compareTo(BigInteger.valueOf(maxValue)) > 0 ||
                bigintItem.compareTo(BigInteger.valueOf(minValue)) < 0)
              throw new ArithmeticException("This Object's value is out of range");
            return bigintItem.intValue();
          }
          case CBORObjectType_Single: {
            float fltItem = ((Float)thisItem).floatValue();
            if (Float.isNaN(fltItem))
              throw new ArithmeticException("This Object's value is out of range");
            fltItem = (fltItem < 0) ? (float)Math.ceil(fltItem) : (float)Math.floor(fltItem);
            if (fltItem >= minValue && fltItem <= maxValue)
              return (int)fltItem;
            throw new ArithmeticException("This Object's value is out of range");
          }
          case CBORObjectType_Double: {
            double fltItem = ((Double)thisItem).doubleValue();
            if (Double.isNaN(fltItem))
              throw new ArithmeticException("This Object's value is out of range");
            fltItem = (fltItem < 0) ? Math.ceil(fltItem) : Math.floor(fltItem);
            if (fltItem >= minValue && fltItem <= maxValue)
              return (int)fltItem;
            throw new ArithmeticException("This Object's value is out of range");
          }
          case CBORObjectType_ExtendedDecimal: {
            BigInteger bi = ((ExtendedDecimal)this.getThisItem()).ToBigInteger();
            if (bi.compareTo(BigInteger.valueOf(maxValue)) > 0 ||
                bi.compareTo(BigInteger.valueOf(minValue)) < 0)
              throw new ArithmeticException("This Object's value is out of range");
            return bi.intValue();
          }
          case CBORObjectType_ExtendedFloat: {
            BigInteger bi = ((ExtendedFloat)this.getThisItem()).ToBigInteger();
            if (bi.compareTo(BigInteger.valueOf(maxValue)) > 0 ||
                bi.compareTo(BigInteger.valueOf(minValue)) < 0)
              throw new ArithmeticException("This Object's value is out of range");
            return bi.intValue();
          }
        default:
          throw new IllegalStateException("Not a number type");
      }
    }

    /**
     * Converts this object to a 32-bit signed integer. Floating point values
     * are truncated to an integer.
     * @return The closest big integer to this object.
     * @throws java.lang.IllegalStateException This object's type is
     * not a number type.
     * @throws java.lang.ArithmeticException This object's value exceeds
     * the range of a 32-bit signed integer.
     */
    public int AsInt32() {
      return AsInt32(Integer.MIN_VALUE, Integer.MAX_VALUE);
    }
    /**
     * Gets the value of this object as a string object.
     * @return Gets this object&apos;s string.
     * @throws IllegalStateException This object's type is not a string.
     */
    public String AsString() {
      int type = this.getItemType();
      switch (type) {
          case CBORObjectType_TextString: {
            return (String)this.getThisItem();
          }
        default:
          throw new IllegalStateException("Not a String type");
      }
    }
    /**
     * Reads an object in CBOR format from a data stream.
     * @param stream A readable data stream.
     * @return a CBOR object that was read.
     * @throws java.lang.NullPointerException "stream" is null.
     * @throws CBORException There was an error in reading or parsing the
     * data.
     */
    public static CBORObject Read(InputStream stream) {
      try {
        return Read(stream, 0, false, -1, null, 0);
      } catch (IOException ex) {
        throw new CBORException("I/O error occurred.", ex);
      }
    }

    private static void WriteObjectArray(
      List<CBORObject> list, OutputStream s) throws IOException {
      WritePositiveInt(4, list.size(), s);
      for(CBORObject i : list) {
        if (i == null)
          s.write(0xf6);
        else
          i.WriteTo(s);
      }
    }
    private static void WriteObjectMap(
      Map<CBORObject, CBORObject> map, OutputStream s) throws IOException {
      WritePositiveInt(5, map.size(), s);
      for(Map.Entry<CBORObject, CBORObject> entry : map.entrySet()) {
        CBORObject key = entry.getKey();
        CBORObject value = entry.getValue();
        if (key == null)
          s.write(0xf6);
        else
          key.WriteTo(s);
        if (value == null)
          s.write(0xf6);
        else
          value.WriteTo(s);
      }
    }
    private static byte[] GetPositiveIntBytes(int type, int value) {
      if ((value) < 0) throw new IllegalArgumentException("value" +
                                                   " not greater or equal to " + "0" + " (" +
                                                   Integer.toString((int)value) + ")");
      if (value < 24) {
        return new byte[]{ (byte)((byte)value | (byte)(type << 5)) };
      } else if (value <= 0xFF) {
        return new byte[]{(byte)(24|(type<<5)),
          (byte)(value&0xFF)};
      } else if (value <= 0xFFFF) {
        return new byte[]{(byte)(25|(type<<5)),
          (byte)((value>>8)&0xFF),
          (byte)(value&0xFF)};
      } else {
        return new byte[]{(byte)(26|(type<<5)),
          (byte)((value>>24)&0xFF),
          (byte)((value>>16)&0xFF),
          (byte)((value>>8)&0xFF),
          (byte)(value&0xFF)};
      }
    }
    private static void WritePositiveInt(int type, int value, OutputStream s) throws IOException {
      byte[] bytes = GetPositiveIntBytes(type, value);
      s.write(bytes,0,bytes.length);
    }
    private static byte[] GetPositiveInt64Bytes(int type, long value) {
      if ((value) < 0) throw new IllegalArgumentException("value" + " not greater or equal to " + "0" + " (" + Long.toString((long)value) + ")");
      if (value < 24) {
        return new byte[]{ (byte)((byte)value | (byte)(type << 5)) };
      } else if (value <= 0xFF) {
        return new byte[]{(byte)(24|(type<<5)),
          (byte)(value&0xFF)};
      } else if (value <= 0xFFFF) {
        return new byte[]{(byte)(25|(type<<5)),
          (byte)((value>>8)&0xFF),
          (byte)(value&0xFF)};
      } else if (value <= 0xFFFFFFFF) {
        return new byte[]{(byte)(26|(type<<5)),
          (byte)((value>>24)&0xFF),
          (byte)((value>>16)&0xFF),
          (byte)((value>>8)&0xFF),
          (byte)(value&0xFF)};
      } else {
        return new byte[]{(byte)(27|(type<<5)),
          (byte)((value>>56)&0xFF),
          (byte)((value>>48)&0xFF),
          (byte)((value>>40)&0xFF),
          (byte)((value>>32)&0xFF),
          (byte)((value>>24)&0xFF),
          (byte)((value>>16)&0xFF),
          (byte)((value>>8)&0xFF),
          (byte)(value&0xFF)};
      }
    }
    private static void WritePositiveInt64(int type, long value, OutputStream s) throws IOException {
      byte[] bytes = GetPositiveInt64Bytes(type, value);
      s.write(bytes,0,bytes.length);
    }
    private static final int StreamedStringBufferLength = 4096;
    private static void WriteStreamedString(String str, OutputStream stream) throws IOException {
      byte[] bytes;
      bytes = GetOptimizedBytesIfShortAscii(str, -1);
      if (bytes != null) {
        stream.write(bytes,0,bytes.length);
        return;
      }
      bytes = new byte[StreamedStringBufferLength];
      int byteIndex = 0;
      boolean streaming = false;
      for (int index = 0; index < str.length(); index++) {
        int c = str.charAt(index);
        if (c <= 0x7F) {
          if (byteIndex >= StreamedStringBufferLength) {
            // Write bytes retrieved so far
            if (!streaming)
              stream.write((byte)0x7F);
            WritePositiveInt(3, byteIndex, stream);
            stream.write(bytes,0,byteIndex);
            byteIndex = 0;
            streaming = true;
          }
          bytes[byteIndex++] = (byte)c;
        } else if (c <= 0x7FF) {
          if (byteIndex + 2 > StreamedStringBufferLength) {
            // Write bytes retrieved so far
            if (!streaming)
              stream.write((byte)0x7F);
            WritePositiveInt(3, byteIndex, stream);
            stream.write(bytes,0,byteIndex);
            byteIndex = 0;
            streaming = true;
          }
          bytes[byteIndex++] = ((byte)(0xC0 | ((c >> 6) & 0x1F)));
          bytes[byteIndex++] = ((byte)(0x80 | (c & 0x3F)));
        } else {
          if (c >= 0xD800 && c <= 0xDBFF && index + 1 < str.length() &&
              str.charAt(index + 1) >= 0xDC00 && str.charAt(index + 1) <= 0xDFFF) {
            // Get the Unicode code point for the surrogate pair
            c = 0x10000 + (c - 0xD800) * 0x400 + (str.charAt(index + 1) - 0xDC00);
            index++;
          } else if (c >= 0xD800 && c <= 0xDFFF) {
            // unpaired surrogate, write U+FFFD instead
            c = 0xFFFD;
          }
          if (c <= 0xFFFF) {
            if (byteIndex + 3 > StreamedStringBufferLength) {
              // Write bytes retrieved so far
              if (!streaming)
                stream.write((byte)0x7F);
              WritePositiveInt(3, byteIndex, stream);
              stream.write(bytes,0,byteIndex);
              byteIndex = 0;
              streaming = true;
            }
            bytes[byteIndex++] = ((byte)(0xE0 | ((c >> 12) & 0x0F)));
            bytes[byteIndex++] = ((byte)(0x80 | ((c >> 6) & 0x3F)));
            bytes[byteIndex++] = ((byte)(0x80 | (c & 0x3F)));
          } else {
            if (byteIndex + 4 > StreamedStringBufferLength) {
              // Write bytes retrieved so far
              if (!streaming)
                stream.write((byte)0x7F);
              WritePositiveInt(3, byteIndex, stream);
              stream.write(bytes,0,byteIndex);
              byteIndex = 0;
              streaming = true;
            }
            bytes[byteIndex++] = ((byte)(0xF0 | ((c >> 18) & 0x07)));
            bytes[byteIndex++] = ((byte)(0x80 | ((c >> 12) & 0x3F)));
            bytes[byteIndex++] = ((byte)(0x80 | ((c >> 6) & 0x3F)));
            bytes[byteIndex++] = ((byte)(0x80 | (c & 0x3F)));
          }
        }
      }
      WritePositiveInt(3, byteIndex, stream);
      stream.write(bytes,0,byteIndex);
      if (streaming) {
        stream.write((byte)0xFF);
      }
    }
    /**
     * Writes a string in CBOR format to a data stream.
     * @param str The string to write. Can be null.
     * @param stream A writable data stream.
     * @throws java.lang.NullPointerException stream is null.
     * @throws java.io.IOException An I/O error occurred.
     */
    public static void Write(String str, OutputStream stream) throws IOException {
      if ((stream) == null) throw new NullPointerException("stream");
      if (str == null) {
        stream.write(0xf6); // Write null instead of String
      } else {
        WriteStreamedString(str, stream);
      }
    }
    private static BigInteger OneShift63 = (BigInteger.ONE.shiftLeft(63));
    private static BigInteger LowestMajorType1 = BigInteger.ZERO .subtract(BigInteger.ONE.shiftLeft(64));
    private static BigInteger UInt64MaxValue = (BigInteger.ONE.shiftLeft(64)).subtract(BigInteger.ONE);
    /**
     * Writes a bigfloat in CBOR format to a data stream.
     * @param stream InputStream to write to.
     * @param bignum An ExtendedFloat object.
     * @throws java.lang.NullPointerException stream is null.
     * @throws java.lang.IllegalArgumentException The value's exponent is less
     * than -(2^64) or greater than (2^64-1).
     * @throws java.io.IOException An I/O error occurred.
     */
    public static void Write(ExtendedFloat bignum, OutputStream stream) throws IOException {
      if ((stream) == null) throw new NullPointerException("stream");
      if (bignum == null) {
        stream.write(0xf6);
        return;
      }
      if((bignum.signum()==0 && bignum.isNegative()) || bignum.IsInfinity() || bignum.IsNaN()){
        Write(bignum.ToDouble(),stream);
        return;
      }
      BigInteger exponent = bignum.getExponent();
      if (exponent.signum()==0) {
        Write(bignum.getMantissa(), stream);
      } else {
        if (!BigIntFits(exponent))
          throw new IllegalArgumentException("Exponent is too low or too high");
        stream.write(0xC5); // tag 5
        stream.write(0x82); // array, length 2
        Write(bignum.getExponent(), stream);
        Write(bignum.getMantissa(), stream);
      }
    }
    /**
     * Writes a bigfloat in CBOR format to a data stream.
     * @param bignum Decimal fraction to write.
     * @param stream InputStream to write to.
     * @throws java.lang.NullPointerException stream is null.
     * @throws java.io.IOException An I/O error occurred.
     * @throws java.lang.IllegalArgumentException The value's exponent is less
     * than -(2^64) or greater than (2^64-1).
     */
    public static void Write(ExtendedDecimal bignum, OutputStream stream) throws IOException {
      if ((stream) == null) throw new NullPointerException("stream");
      if (bignum == null) {
        stream.write(0xf6);
        return;
      }
      if((bignum.signum()==0 && bignum.isNegative()) || bignum.IsInfinity() || bignum.IsNaN()){
        Write(bignum.ToDouble(),stream);
        return;
      }
      BigInteger exponent = bignum.getExponent();
      if (exponent.signum()==0) {
        Write(bignum.getMantissa(), stream);
      } else {
        if (!BigIntFits(exponent))
          throw new IllegalArgumentException("Exponent is too low or too high");
        stream.write(0xC4); // tag 4
        stream.write(0x82); // array, length 2
        Write(bignum.getExponent(), stream);
        Write(bignum.getMantissa(), stream);
      }
    }
    /**
     * Writes a big integer in CBOR format to a data stream.
     * @param bigint Big integer to write.
     * @param stream A writable data stream.
     * @throws java.lang.NullPointerException s is null.
     * @throws java.io.IOException An I/O error occurred.
     */
    public static void Write(BigInteger bigint, OutputStream stream) throws IOException {
      if ((stream) == null) throw new NullPointerException("stream");
      if ((Object)bigint == (Object)null) {
        stream.write(0xf6);
        return;
      }
      int datatype = 0;
      if (bigint.signum() < 0) {
        datatype = 1;
        bigint=bigint.add(BigInteger.ONE);
        bigint=(bigint).negate();
      }
      if (bigint.compareTo(Int64MaxValue) <= 0) {
        // If the big integer is representable as a long and in
        // major type 0 or 1, write that major type
        // instead of as a bignum
        long ui = bigint.longValue();
        WritePositiveInt64(datatype, ui, stream);
      } else {
        // Get a byte array of the big integer's value,
        // since shifting and doing AND operations is
        // slow with large BigIntegers
        byte[] bytes = bigint.toByteArray(true);
        int byteCount = bytes.length;
        while (byteCount > 0 && bytes[byteCount - 1] == 0) {
          // Ignore trailing zero bytes
          byteCount--;
        }
        if (byteCount == 0) {
          WritePositiveInt64(datatype, 0, stream);
          return;
        }
        int half = byteCount >> 1;
        int right = byteCount - 1;
        for (int i = 0; i < half; i++, right--) {
          byte value = bytes[i];
          bytes[i] = bytes[right];
          bytes[right] = value;
        }
        switch (byteCount) {
          case 1:
            WritePositiveInt(datatype, ((int)bytes[0]) & 0xFF, stream);
            break;
          case 2:
            stream.write((byte)((datatype << 5) | 24));
            stream.write(bytes,0,byteCount);
            break;
          case 3:
            stream.write((byte)((datatype << 5) | 24));
            stream.write(bytes,0,byteCount);
            break;
          case 4:
            stream.write((byte)((datatype << 5) | 24));
            stream.write(bytes,0,byteCount);
            break;
          default:
            stream.write((datatype == 0) ?
                             (byte)0xC2 :
                             (byte)0xC3);
            WritePositiveInt(2, byteCount, stream);
            stream.write(bytes,0,byteCount);
            break;
        }
      }
    }
    /**
     * Writes this CBOR object to a data stream.
     * @param stream A writable data stream.
     * @throws java.lang.NullPointerException s is null.
     * @throws java.io.IOException An I/O error occurred.
     */
    public void WriteTo(OutputStream stream) throws IOException {
      if ((stream) == null) throw new NullPointerException("stream");
      WriteTags(stream);
      int type = this.getItemType();
      if (type == CBORObjectType_Integer) {
        Write((((Long)this.getThisItem()).longValue()), stream);
      } else if (type == CBORObjectType_BigInteger) {
        Write((BigInteger)this.getThisItem(), stream);
      } else if (type == CBORObjectType_ByteString) {
        byte[] arr = (byte[])this.getThisItem();
        WritePositiveInt((this.getItemType() == CBORObjectType_ByteString) ? 2 : 3,
                         arr.length, stream);
        stream.write(arr,0,arr.length);
      } else if (type == CBORObjectType_TextString) {
        Write((String)this.getThisItem(), stream);
      } else if (type == CBORObjectType_Array) {
        WriteObjectArray(AsList(), stream);
      } else if (type == CBORObjectType_ExtendedDecimal) {
        ExtendedDecimal dec = (ExtendedDecimal)this.getThisItem();
        Write(dec, stream);
      } else if (type == CBORObjectType_ExtendedFloat) {
        ExtendedFloat dec = (ExtendedFloat)this.getThisItem();
        Write(dec, stream);
      } else if (type == CBORObjectType_Map) {
        WriteObjectMap(AsMap(), stream);
      } else if (type == CBORObjectType_SimpleValue) {
        int value = ((Integer)this.getThisItem()).intValue();
        if (value < 24) {
          stream.write((byte)(0xE0 + value));
        } else {
          stream.write(0xF8);
          stream.write((byte)value);
        }
      } else if (type == CBORObjectType_Single) {
        Write(((Float)this.getThisItem()).floatValue(), stream);
      } else if (type == CBORObjectType_Double) {
        Write(((Double)this.getThisItem()).doubleValue(), stream);
      } else {
        throw new IllegalArgumentException("Unexpected data type");
      }
    }
    /**
     * Writes a 64-bit unsigned integer in CBOR format to a data stream.
     * @param value The value to write
     * @param stream A writable data stream.
     * @throws java.lang.NullPointerException s is null.
     * @throws java.io.IOException An I/O error occurred.
     */
    public static void Write(long value, OutputStream stream) throws IOException {
      if ((stream) == null) throw new NullPointerException("stream");
      if (value >= 0) {
        WritePositiveInt64(0, value, stream);
      } else {
        value += 1;
        value = -value; // Will never overflow
        WritePositiveInt64(1, value, stream);
      }
    }
    /**
     * Writes a 32-bit signed integer in CBOR format to a data stream.
     * @param value The value to write
     * @param stream A writable data stream.
     * @throws java.lang.NullPointerException s is null.
     * @throws java.io.IOException An I/O error occurred.
     */
    public static void Write(int value, OutputStream stream) throws IOException {
      Write((long)value, stream);
    }
    /**
     * Writes a 16-bit signed integer in CBOR format to a data stream.
     * @param value The value to write
     * @param stream A writable data stream.
     * @throws java.lang.NullPointerException s is null.
     * @throws java.io.IOException An I/O error occurred.
     */
    public static void Write(short value, OutputStream stream) throws IOException {
      Write((long)value, stream);
    }
    /**
     * Writes a Unicode character as a string in CBOR format to a data stream.
     * @param value The value to write
     * @param stream A writable data stream.
     * @throws java.lang.NullPointerException s is null.
     * @throws java.lang.IllegalArgumentException "s" is a surrogate code point.
     * @throws java.io.IOException An I/O error occurred.
     */
    public static void Write(char value, OutputStream stream) throws IOException {
      if (value >= 0xd800 && value < 0xe000) {
        throw new IllegalArgumentException("Value is a surrogate code point.");
      }
      Write(new String(new char[] { value }), stream);
    }
    /**
     * Writes a Boolean value in CBOR format to a data stream.
     * @param value The value to write
     * @param stream A writable data stream.
     * @throws java.lang.NullPointerException s is null.
     * @throws java.io.IOException An I/O error occurred.
     */
    public static void Write(boolean value, OutputStream stream) throws IOException {
      if ((stream) == null) throw new NullPointerException("stream");
      stream.write(value ? (byte)0xf5 : (byte)0xf4);
    }
    /**
     * Writes a byte (0 to 255) in CBOR format to a data stream.
     * @param value The value to write
     * @param stream A writable data stream.
     * @throws java.lang.NullPointerException s is null.
     * @throws java.io.IOException An I/O error occurred.
     */
    public static void Write(byte value, OutputStream stream) throws IOException {
      if ((stream) == null) throw new NullPointerException("stream");
      if ((((int)value) & 0xFF) < 24) {
        stream.write(value);
      } else {
        stream.write((byte)(24));
        stream.write(value);
      }
    }
    /**
     * Writes a 32-bit floating-point number in CBOR format to a data stream.
     * @param value The value to write
     * @param s A writable data stream.
     * @throws java.lang.NullPointerException s is null.
     * @throws java.io.IOException An I/O error occurred.
     */
    public static void Write(float value, OutputStream s) throws IOException {
      if ((s) == null) throw new NullPointerException("s");
      int bits = Float.floatToRawIntBits(value);
      byte[] data = new byte[]{(byte)0xFA,
        (byte)((bits>>24)&0xFF),
        (byte)((bits>>16)&0xFF),
        (byte)((bits>>8)&0xFF),
        (byte)(bits&0xFF)};
      s.write(data,0,5);
    }
    /**
     * Writes a 64-bit floating-point number in CBOR format to a data stream.
     * @param value The value to write
     * @param stream A writable data stream.
     * @throws java.lang.NullPointerException s is null.
     * @throws java.io.IOException An I/O error occurred.
     */
    public static void Write(double value, OutputStream stream) throws IOException {
      if((stream)==null)throw new NullPointerException("stream");
      long bits = Double.doubleToRawLongBits((double)value);
      byte[] data = new byte[]{(byte)0xFB,
        (byte)((bits>>56)&0xFF),
        (byte)((bits>>48)&0xFF),
        (byte)((bits>>40)&0xFF),
        (byte)((bits>>32)&0xFF),
        (byte)((bits>>24)&0xFF),
        (byte)((bits>>16)&0xFF),
        (byte)((bits>>8)&0xFF),
        (byte)(bits&0xFF)};
      stream.write(data,0,9);
    }
    private static byte[] GetOptimizedBytesIfShortAscii(String str, int tagbyte) {
      byte[] bytes;
      if (str.length() <= 255) {
        // The strings will usually be short ASCII strings, so
        // use this optimization
        int offset = 0;
        int length = str.length();
        int extra = (length < 24) ? 1 : 2;
        if (tagbyte >= 0) extra++;
        bytes = new byte[length + extra];
        if (tagbyte >= 0) {
          bytes[offset] = ((byte)(tagbyte));
          offset++;
        }
        if (length < 24) {
          bytes[offset] = ((byte)(0x60 + str.length()));
          offset++;
        } else {
          bytes[offset] = ((byte)(0x78));
          bytes[offset + 1] = ((byte)(str.length()));
          offset += 2;
        }
        boolean issimple = true;
        for (int i = 0; i < str.length(); i++) {
          char c = str.charAt(i);
          if (c >= 0x80) {
            issimple = false;
            break;
          }
          bytes[i + offset] = ((byte)c);
        }
        if (issimple) {
          return bytes;
        }
      }
      return null;
    }
    /**
     * Gets the binary representation of this data item.
     * @return A byte array in CBOR format.
     */
    public byte[] EncodeToBytes() {
      // For some types, a memory stream is a lot of
      // overhead since the amount of memory the types
      // use is fixed and small
      boolean hasComplexTag = false;
      byte tagbyte = 0;
      boolean tagged = this.isTagged();
      if (this.isTagged()) {
        CBORObject taggedItem = (CBORObject)item_;
        if (taggedItem.isTagged() ||
            this.tagHigh != 0 ||
            ((this.tagLow) >> 16) != 0 ||
            this.tagLow >= 24) {
          hasComplexTag = true;
        } else {
          tagbyte = (byte)(0xC0 + (int)this.tagLow);
        }
      }
      if (!hasComplexTag) {
        if (this.getItemType() == CBORObjectType_TextString) {
          byte[] ret = GetOptimizedBytesIfShortAscii(
            this.AsString(),
            tagged ? (((int)tagbyte) & 0xFF) : -1);
          if (ret != null) return ret;
        } else if (this.getItemType() == CBORObjectType_SimpleValue) {
          if (tagged) {
            if (this.isFalse()) return new byte[]{ tagbyte, (byte)0xf4 };
            if (this.isTrue()) return new byte[]{ tagbyte, (byte)0xf5 };
            if (this.isNull()) return new byte[]{ tagbyte, (byte)0xf6 };
            if (this.isUndefined()) return new byte[]{ tagbyte, (byte)0xf7 };
          } else {
            if (this.isFalse()) return new byte[]{ (byte)0xf4 };
            if (this.isTrue()) return new byte[]{ (byte)0xf5 };
            if (this.isNull()) return new byte[]{ (byte)0xf6 };
            if (this.isUndefined()) return new byte[]{ (byte)0xf7 };
          }
        } else if (this.getItemType() == CBORObjectType_Integer) {
          long value = (((Long)this.getThisItem()).longValue());
          byte[] intBytes = null;
          if (value >= 0) {
            intBytes = GetPositiveInt64Bytes(0, value);
          } else {
            value += 1;
            value = -value; // Will never overflow
            intBytes = GetPositiveInt64Bytes(1, value);
          }
          if (!tagged) return intBytes;
          byte[] ret2 = new byte[intBytes.length + 1];
          System.arraycopy(intBytes, 0, ret2, 1, intBytes.length);
          ret2[0] = tagbyte;
          return ret2;
        } else if (this.getItemType() == CBORObjectType_Single) {
          float value = ((Float)this.getThisItem()).floatValue();
          int bits = Float.floatToRawIntBits(value);
          return tagged ?
            new byte[]{tagbyte,(byte)0xFA,
            (byte)((bits>>24)&0xFF),
            (byte)((bits>>16)&0xFF),
            (byte)((bits>>8)&0xFF),
            (byte)(bits&0xFF)} :
            new byte[]{(byte)0xFA,
            (byte)((bits>>24)&0xFF),
            (byte)((bits>>16)&0xFF),
            (byte)((bits>>8)&0xFF),
            (byte)(bits&0xFF)};
        } else if (this.getItemType() == CBORObjectType_Double) {
          double value = ((Double)this.getThisItem()).doubleValue();
          long bits = Double.doubleToRawLongBits(value);
          return tagged ?
            new byte[]{tagbyte,(byte)0xFB,
            (byte)((bits>>56)&0xFF),
            (byte)((bits>>48)&0xFF),
            (byte)((bits>>40)&0xFF),
            (byte)((bits>>32)&0xFF),
            (byte)((bits>>24)&0xFF),
            (byte)((bits>>16)&0xFF),
            (byte)((bits>>8)&0xFF),
            (byte)(bits&0xFF)} :
            new byte[]{(byte)0xFB,
            (byte)((bits>>56)&0xFF),
            (byte)((bits>>48)&0xFF),
            (byte)((bits>>40)&0xFF),
            (byte)((bits>>32)&0xFF),
            (byte)((bits>>24)&0xFF),
            (byte)((bits>>16)&0xFF),
            (byte)((bits>>8)&0xFF),
            (byte)(bits&0xFF)};
        }
      }
      try {
        java.io.ByteArrayOutputStream ms=null;
try {
ms=new ByteArrayOutputStream(16);

          WriteTo(ms);
          return ms.toByteArray();
}
finally {
try { if(ms!=null)ms.close(); } catch(IOException ex){}
}
      } catch (IOException ex) {
        throw new CBORException("I/O Error occurred", ex);
      }
    }
    /**
     * Writes a CBOR object to a CBOR data stream.
     * @param value The value to write
     * @param stream A writable data stream.
     */
    public static void Write(CBORObject value, OutputStream stream) throws IOException {
      if ((stream) == null) throw new NullPointerException("stream");
      if (value == null) {
        stream.write(0xf6);
      } else {
        value.WriteTo(stream);
      }
    }
    /**
     * Writes an arbitrary object to a CBOR data stream.
     * @param objValue The value to write
     * @param stream A writable data stream.
     */
    @SuppressWarnings("unchecked")
public static void Write(Object objValue, OutputStream stream) throws IOException {
      if ((stream) == null) throw new NullPointerException("stream");
      if (objValue == null) {
        stream.write(0xf6);
        return;
      }
      byte[] data=(((objValue instanceof byte[]) ? (byte[])objValue : null));
      if(data!=null) {
        WritePositiveInt(3, data.length, stream);
        stream.write(data,0,data.length);
        return;
      } else if(objValue instanceof List<?>) {
        WriteObjectArray((List<CBORObject>)objValue, stream);
      } else if(objValue instanceof Map<?,?>) {
        WriteObjectMap((Map<CBORObject, CBORObject>)objValue, stream);
      } else {
        FromObject(objValue).WriteTo(stream);
      }
    }
    /**
     * Generates a CBOR object from a string in JavaScript Object Notation
     * (JSON) format. This function only accepts maps and arrays.
     * @param str A string in JSON format.
     * @return A CBORObject object.
     * @throws java.lang.NullPointerException "str" is null.
     * @throws CBORException The string is not in JSON format.
     */
    public static CBORObject FromJSONString(String str) {
      JSONTokener tokener = new JSONTokener(str, 0);
      CBORObject obj = tokener.ParseJSONObjectOrArray();
      if (tokener.nextClean() != -1)
        throw tokener.syntaxError("End of String not reached");
      return obj;
    }
    /**
     * Generates a CBOR object from a data stream in JavaScript Object Notation
     * (JSON) format and UTF-8 encoding. This function only accepts maps
     * and arrays.
     * @param stream A readable data stream.
     * @return A CBORObject object.
     * @throws java.lang.NullPointerException "stream" is null.
     * @throws java.io.IOException An I/O error occurred.
     * @throws CBORException The data stream contains invalid UTF-8 or
     * is not in JSON format.
     */
    public static CBORObject ReadJSON(InputStream stream) throws IOException {
      JSONTokener tokener = new JSONTokener(stream, 0);
      try {
        CBORObject obj = tokener.ParseJSONObjectOrArray();
        if (tokener.nextClean() != -1)
          throw tokener.syntaxError("End of data stream not reached");
        return obj;
      } catch (CBORException ex) {
        if (ex.getCause() != null && ex.getCause() instanceof IOException)
          throw (IOException)ex.getCause();
        throw ex;
      }
    }
    private static void StringToJSONStringUnquoted(String str, StringBuilder sb) {
      // Surrogates were already verified when this
      // String was added to the CBOR Object; that check
      // is not repeated here
      boolean first = true;
      for (int i = 0; i < str.length(); i++) {
        char c = str.charAt(i);
        if (c == '\\' || c == '"') {
          if (first) {
            first = false;
            sb.append(str,0,(0)+(i));
          }
          sb.append('\\');
          sb.append(c);
        } else if (c < 0x20) {
          if (first) {
            first = false;
            sb.append(str,0,(0)+(i));
          }
          if (c == 0x0d) {
            sb.append("\\r");
          } else if (c == 0x0a) {
            sb.append("\\n");
          } else if (c == 0x08) {
            sb.append("\\b");
          } else if (c == 0x0c) {
            sb.append("\\f");
          } else if (c == 0x09) {
            sb.append("\\t");
          } else {
            sb.append("\\u00");
            sb.append((char)('0' + (int)(c >> 4)));
            sb.append((char)('0' + (int)(c & 15)));
          }
        } else if (!first) {
          sb.append(c);
        }
      }
      if (first) {
        sb.append(str);
      }
    }
    /**
     * Converts this object to a JSON string. This function works not only
     * with arrays and maps (the only proper JSON objects under RFC 4627),
     * but also integers, strings, byte arrays, and other JSON data types.
     * @return A string object.
     */
    public String ToJSONString() {
      int type = this.getItemType();
      switch (type) {
          case (CBORObjectType_SimpleValue): {
            if (this.isTrue()) return "true";
            else if (this.isFalse()) return "false";
            else if (this.isNull()) return "null";
            else return "null";
          }
          case (CBORObjectType_Single): {
            float f = ((Float)this.getThisItem()).floatValue();
            if (((f)==Float.NEGATIVE_INFINITY) ||
                ((f)==Float.POSITIVE_INFINITY) ||
                Float.isNaN(f)) return "null";
            else
              return TrimDotZero(Float.toString((float)f));
          }
          case (CBORObjectType_Double): {
            double f = ((Double)this.getThisItem()).doubleValue();
            if (((f)==Double.NEGATIVE_INFINITY) ||
                ((f)==Double.POSITIVE_INFINITY) ||
                Double.isNaN(f)) return "null";
            else
              return TrimDotZero(Double.toString((double)f));
          }
          case (CBORObjectType_Integer): {
            return Long.toString((((Long)this.getThisItem()).longValue()));
          }
          case (CBORObjectType_BigInteger): {
            return CBORUtilities.BigIntToString((BigInteger)this.getThisItem());
          }
          case (CBORObjectType_ExtendedDecimal): {
            return ((ExtendedDecimal)this.getThisItem()).toString();
          }
          case (CBORObjectType_ExtendedFloat): {
            return ((ExtendedFloat)this.getThisItem()).toString();
          }
          default: {
            StringBuilder sb = new StringBuilder();
            ToJSONString(sb);
            return sb.toString();
          }
      }
    }

    private void ToJSONString(StringBuilder sb) {
      int type = this.getItemType();
      switch (type) {
        case CBORObjectType_SimpleValue:
        case CBORObjectType_Single:
        case CBORObjectType_Double:
        case CBORObjectType_Integer:
        case CBORObjectType_BigInteger:
        case CBORObjectType_ExtendedDecimal:
        case CBORObjectType_ExtendedFloat:
          sb.append(ToJSONString());
          break;
          case CBORObjectType_ByteString: {
            sb.append('\"');
            if (this.HasTag(22)) {
              CBORUtilities.ToBase64(sb, (byte[])this.getThisItem(), false);
            } else if (this.HasTag(23)) {
              CBORUtilities.ToBase16(sb, (byte[])this.getThisItem());
            } else {
              CBORUtilities.ToBase64URL(sb, (byte[])this.getThisItem(), false);
            }
            sb.append('\"');
            break;
          }
          case CBORObjectType_TextString: {
            sb.append('\"');
            StringToJSONStringUnquoted((String)this.getThisItem(), sb);
            sb.append('\"');
            break;
          }
          case CBORObjectType_Array: {
            boolean first = true;
            sb.append('[');
            for(CBORObject i : AsList()) {
              if (!first) sb.append(',');
              i.ToJSONString(sb);
              first = false;
            }
            sb.append(']');
            break;
          }
          case CBORObjectType_Map: {
            boolean first = true;
            boolean hasNonStringKeys = false;
            Map<CBORObject, CBORObject> objMap = AsMap();
            sb.append('{');
            int oldLength = sb.length();
            for(Map.Entry<CBORObject, CBORObject> entry : objMap.entrySet()) {
              CBORObject key = entry.getKey();
              CBORObject value = entry.getValue();
              if (key.getItemType() != CBORObjectType_TextString) {
                hasNonStringKeys = true;
                break;
              }
              if (!first) sb.append(',');
              sb.append('\"');
              StringToJSONStringUnquoted((String)key.getThisItem(), sb);
              sb.append('\"');
              sb.append(':');
              value.ToJSONString(sb);
              first = false;
            }
            if (hasNonStringKeys) {
              sb.delete(oldLength,(oldLength)+(sb.length() - oldLength));
              HashMap<String, CBORObject> sMap=new HashMap<String, CBORObject>();
              // Copy to a map with String keys, since
              // some keys could be duplicates
              // when serialized to strings
              for(Map.Entry<CBORObject, CBORObject> entry : objMap.entrySet()) {
                CBORObject key = entry.getKey();
                CBORObject value = entry.getValue();
                String str = (key.getItemType() == CBORObjectType_TextString) ?
                  ((String)key.getThisItem()) : key.ToJSONString();
                sMap.put(str,value);
              }
              first = true;
              for(Map.Entry<String, CBORObject> entry : sMap.entrySet()) {
                String key = entry.getKey();
                CBORObject value = entry.getValue();
                if (!first) sb.append(',');
                sb.append('\"');
                StringToJSONStringUnquoted(key, sb);
                sb.append('\"');
                sb.append(':');
                value.ToJSONString(sb);
                first = false;
              }
            }
            sb.append('}');
            break;
          }
        default:
          throw new IllegalStateException("Unexpected data type");
      }
    }
    static CBORObject FromRaw(String str) {
      return new CBORObject(CBORObjectType_TextString, str);
    }

    static CBORObject FromRaw(List<CBORObject> list) {
      return new CBORObject(CBORObjectType_Array, list);
    }
    static CBORObject FromRaw(Map<CBORObject, CBORObject> map) {
      return new CBORObject(CBORObjectType_Map, map);
    }
    /**
     * Finds the sum of two CBOR number objects.
     * @param first A CBORObject object.
     * @param second A CBORObject object.
     * @return A CBORObject object.
     * @throws java.lang.IllegalArgumentException Either or both operands are not
     * numbers (as opposed to Not-a-Number, NaN).
     */
    public static CBORObject Addition(CBORObject first, CBORObject second) {
      return CBORObjectMath.Addition(first, second);
    }
    /**
     * Finds the difference between two CBOR number objects.
     * @param first A CBORObject object.
     * @param second A CBORObject object.
     * @return The difference of the two objects.
     * @throws java.lang.IllegalArgumentException Either or both operands are not
     * numbers (as opposed to Not-a-Number, NaN).
     */
    public static CBORObject Subtract(CBORObject first, CBORObject second) {
      return CBORObjectMath.Subtract(first, second);
    }
    /**
     * Multiplies two CBOR number objects.
     * @param first A CBORObject object.
     * @param second A CBORObject object.
     * @return The product of the two objects.
     * @throws java.lang.IllegalArgumentException Either or both operands are not
     * numbers (as opposed to Not-a-Number, NaN).
     */
    public static CBORObject Multiply(CBORObject first, CBORObject second) {
      return CBORObjectMath.Multiply(first, second);
    }
    /**
     * Creates a new empty CBOR array.
     * @return A new CBOR array.
     */
    public static CBORObject NewArray() {
      return FromObject(new ArrayList<CBORObject>());
    }
    /**
     * Creates a new empty CBOR map.
     * @return A new CBOR map.
     */
    public static CBORObject NewMap() {
      return FromObject(new HashMap<CBORObject, CBORObject>());
    }
    //-----------------------------------------------------------
    /**
     * Generates a CBOR object from a 64-bit signed integer.
     * @param value A 64-bit signed integer.
     * @return A CBORObject object.
     */
    public static CBORObject FromObject(long value) {
      return new CBORObject(CBORObjectType_Integer, value);
    }
    /**
     * Generates a CBOR object from a CBOR object.
     * @param value A CBOR object.
     * @return Same as &quot;value&quot;, or CBORObject.Null if &quot;value&quot;
     * is null.
     */
    public static CBORObject FromObject(CBORObject value) {
      if (value == null) return CBORObject.Null;
      return value;
    }
    /**
     * Generates a CBOR object from an arbitrary-precision integer.
     * @param bigintValue An arbitrary-precision value.
     * @return A CBOR number object.
     */
    public static CBORObject FromObject(BigInteger bigintValue) {
      if ((Object)bigintValue == (Object)null)
        return CBORObject.Null;
      if (bigintValue.compareTo(Int64MinValue) >= 0 &&
          bigintValue.compareTo(Int64MaxValue) <= 0) {
        return new CBORObject(CBORObjectType_Integer, bigintValue.longValue());
      } else {
        return new CBORObject(CBORObjectType_BigInteger, bigintValue);
      }
    }
    /**
     * Generates a CBOR object from an arbitrary-precision binary floating-point
     * number.
     * @param bigValue An arbitrary-precision binary floating-point
     * number.
     * @return A CBOR number object.
     * @throws java.lang.IllegalArgumentException The value's exponent is less
     * than -(2^64) or greater than (2^64-1).
     */
    public static CBORObject FromObject(ExtendedFloat bigValue) {
      if ((Object)bigValue == (Object)null)
        return CBORObject.Null;
      if(bigValue.IsNaN() || bigValue.IsInfinity()){
        return new CBORObject(CBORObjectType_ExtendedFloat,bigValue);
      }
      BigInteger bigintExponent = bigValue.getExponent();
      if (bigintExponent.signum()==0 && !(bigValue.signum()==0 && bigValue.isNegative())) {
        return FromObject(bigValue.getMantissa());
      } else {
        if (!BigIntFits(bigintExponent))
          throw new IllegalArgumentException("Exponent is too low or too high");
        return new CBORObject(CBORObjectType_ExtendedFloat, bigValue);
      }
    }
    /**
     * Generates a CBOR object from a decimal fraction.
     * @param decfrac An arbitrary-precision decimal number.
     * @return A CBOR number object.
     * @throws java.lang.IllegalArgumentException The value's exponent is less
     * than -(2^64) or greater than (2^64-1).
     */
    public static CBORObject FromObject(ExtendedDecimal decfrac) {
      if ((Object)decfrac == (Object)null)
        return CBORObject.Null;
      if(decfrac.IsNaN() || decfrac.IsInfinity()){
        return new CBORObject(CBORObjectType_ExtendedDecimal, decfrac);
      }
      BigInteger bigintExponent = decfrac.getExponent();
      if (bigintExponent.signum()==0 && !(decfrac.signum()==0 && decfrac.isNegative())) {
        return FromObject(decfrac.getMantissa());
      } else {
        if (!BigIntFits(bigintExponent))
          throw new IllegalArgumentException("Exponent is too low or too high");
        return new CBORObject(CBORObjectType_ExtendedDecimal, decfrac);
      }
    }
    /**
     * Generates a CBOR object from a string.
     * @param strValue A string value. Can be null.
     * @return A CBOR object representing the string, or CBORObject.Null
     * if stringValue is null.
     * @throws java.lang.IllegalArgumentException The string contains an unpaired
     * surrogate code point.
     */
    public static CBORObject FromObject(String strValue) {
      if (strValue == null) return CBORObject.Null;
      if (DataUtilities.GetUtf8Length(strValue, false) < 0)
        throw new IllegalArgumentException("String contains an unpaired surrogate code point.");
      return new CBORObject(CBORObjectType_TextString, strValue);
    }
    /**
     * Generates a CBOR object from a 32-bit signed integer.
     * @param value A 32-bit signed integer.
     * @return A CBORObject object.
     */
    public static CBORObject FromObject(int value) {
      return FromObject((long)value);
    }
    /**
     * Generates a CBOR object from a 16-bit signed integer.
     * @param value An Int16 object.
     * @return A CBORObject object.
     */
    public static CBORObject FromObject(short value) {
      return FromObject((long)value);
    }
    /**
     * Generates a CBOR string object from a Unicode character.
     * @param value A char object.
     * @return A CBORObject object.
     */
    public static CBORObject FromObject(char value) {
      return FromObject(new String(new char[] { value }));
    }
    /**
     * Returns the CBOR true value or false value, depending on "value".
     * @param value A Boolean object.
     * @return A CBORObject object.
     */
    public static CBORObject FromObject(boolean value) {
      return (value ? CBORObject.True : CBORObject.False);
    }
    /**
     * Generates a CBOR object from a byte (0 to 255).
     * @param value A Byte object.
     * @return A CBORObject object.
     */
    public static CBORObject FromObject(byte value) {
      return FromObject(((int)value) & 0xFF);
    }
    /**
     * Generates a CBOR object from a 32-bit floating-point number.
     * @param value A 32-bit floating-point number.
     * @return A CBORObject object.
     */
    public static CBORObject FromObject(float value) {
      return new CBORObject(CBORObjectType_Single, value);
    }
    /**
     * Generates a CBOR object from a 64-bit floating-point number.
     * @param value A 64-bit floating-point number.
     * @return A CBORObject object.
     */
    public static CBORObject FromObject(double value) {
      return new CBORObject(CBORObjectType_Double, value);
    }
    /**
     * Generates a CBOR object from a byte array. The byte array is copied
     * to a new byte array.
     * @param bytes A byte array. Can be null.
     * @return A CBOR byte string object where each byte of the given byte
     * array is copied to a new array, or CBORObject.Null if &quot;bytes&quot;
     * is null.
     */
    public static CBORObject FromObject(byte[] bytes) {
      if (bytes == null) return CBORObject.Null;
      byte[] newvalue = new byte[bytes.length];
      System.arraycopy(bytes, 0, newvalue, 0, bytes.length);
      return new CBORObject(CBORObjectType_ByteString, bytes);
    }
    /**
     * Generates a CBOR object from an array of CBOR objects.
     * @param array An array of CBOR objects.
     * @return A CBOR object where each element of the given array is copied
     * to a new array, or CBORObject.Null if &quot;array&quot; is null.
     */
    public static CBORObject FromObject(CBORObject[] array) {
      if (array == null) return CBORObject.Null;
      List<CBORObject> list = new ArrayList<CBORObject>();
      for(CBORObject i : array) {
        list.add(FromObject(i));
      }
      return new CBORObject(CBORObjectType_Array, list);
    }
    /**
     * Generates a CBOR object from an array of 32-bit integers.
     * @param array An array of 32-bit integers.
     * @return A CBOR array object where each element of the given array is
     * copied to a new array, or CBORObject.Null if &quot;array&quot; is
     * null.
     */
    public static CBORObject FromObject(int[] array) {
      if (array == null) return CBORObject.Null;
      List<CBORObject> list = new ArrayList<CBORObject>();
      for(int i : array) {
        list.add(FromObject(i));
      }
      return new CBORObject(CBORObjectType_Array, list);
    }
    /**
     * Generates a CBOR object from an array of 64-bit integers.
     * @param array An array of 64-bit integers.
     * @return A CBOR array object where each element of the given array is
     * copied to a new array, or CBORObject.Null if &quot;array&quot; is
     * null.
     */
    public static CBORObject FromObject(long[] array) {
      if (array == null) return CBORObject.Null;
      List<CBORObject> list = new ArrayList<CBORObject>();
      for(long i : array) {
        list.add(FromObject(i));
      }
      return new CBORObject(CBORObjectType_Array, list);
    }
    /**
     * Generates a CBOR object from an list of objects.
     * @param value An array of CBOR objects.
     * @return A CBOR object where each element of the given array is converted
     * to a CBOR object and copied to a new array, or CBORObject.Null if &quot;value&quot;
     * is null.
     */
    public static <T> CBORObject FromObject(List<T> value) {
      if (value == null) return CBORObject.Null;
      List<CBORObject> list = new ArrayList<CBORObject>();
      for(T i : (List<T>)value) {
        CBORObject obj = FromObject(i);
        list.add(obj);
      }
      return new CBORObject(CBORObjectType_Array, list);
    }
    /**
     * Generates a CBOR object from a map of objects.
     * @param dic A map of CBOR objects.
     * @return A CBOR object where each key and value of the given map is converted
     * to a CBOR object and copied to a new map, or CBORObject.Null if &quot;dic&quot;
     * is null.
     */
    public static <TKey, TValue> CBORObject FromObject(Map<TKey, TValue> dic) {
      if (dic == null) return CBORObject.Null;
      HashMap<CBORObject, CBORObject> map=new HashMap<CBORObject, CBORObject>();
      for(Map.Entry<TKey, TValue> entry : dic.entrySet()) {
        CBORObject key = FromObject(entry.getKey());
        CBORObject value = FromObject(entry.getValue());
        map.put(key,value);
      }
      return new CBORObject(CBORObjectType_Map, map);
    }
    /**
     * Generates a CBORObject from an arbitrary object.
     * @param obj An arbitrary object.
     * @return A CBOR object corresponding to the given object. Returns
     * CBORObject.Null if the object is null.
     * @throws java.lang.IllegalArgumentException The object's type is not supported.
     */
    @SuppressWarnings("unchecked")
public static CBORObject FromObject(Object obj) {
      if (obj == null) return CBORObject.Null;
      if(obj instanceof Long) return FromObject((((Long)obj).longValue()));
      if(obj instanceof CBORObject) return FromObject((CBORObject)obj);
      if(obj instanceof BigInteger) return FromObject((BigInteger)obj);
      ExtendedDecimal df=(((obj instanceof ExtendedDecimal) ? (ExtendedDecimal)obj : null));
      if (df!=null) return FromObject(df);
      ExtendedFloat bf=(((obj instanceof ExtendedFloat) ? (ExtendedFloat)obj : null));
      if (bf!=null) return FromObject(bf);
      if(obj instanceof String) return FromObject((String)obj);
      if(obj instanceof Integer) return FromObject(((Integer)obj).intValue());
      if(obj instanceof Short) return FromObject(((Short)obj).shortValue());
      if(obj instanceof Character) return FromObject(((Character)obj).charValue());
      if(obj instanceof Boolean) return FromObject(((Boolean)obj).booleanValue());
      if(obj instanceof Byte) return FromObject(((Byte)obj).byteValue());
      if(obj instanceof Float) return FromObject(((Float)obj).floatValue());

      if(obj instanceof Double) return FromObject(((Double)obj).doubleValue());
      if(obj instanceof List<?>) return FromObject((List<CBORObject>)obj);
      byte[] bytearr=(((obj instanceof byte[]) ? (byte[])obj : null));
      if (bytearr!=null) return FromObject(bytearr);
      int[] intarr=(((obj instanceof int[]) ? (int[])obj : null));
      if (intarr!=null) return FromObject(intarr);
      long[] longarr=(((obj instanceof long[]) ? (long[])obj : null));
      if (longarr!=null) return FromObject(longarr);
      if(obj instanceof CBORObject[]) return FromObject((CBORObject[])obj);
      if(obj instanceof Map<?,?>) return FromObject(
        (Map<CBORObject, CBORObject>)obj);
      if(obj instanceof Map<?,?>) return FromObject(
        (Map<String, CBORObject>)obj);
      throw new IllegalArgumentException("Unsupported Object type.");
    }
    private static BigInteger BigInt65536 = BigInteger.valueOf(65536);
    /**
     * Generates a CBOR object from an arbitrary object and gives the resulting
     * object a tag.
     * @param o An arbitrary object.
     * @param bigintTag A big integer that specifies a tag number.
     * @return a CBOR object where the object &quot;o&quot; is converted
     * to a CBOR object and given the tag &quot;bigintTag&quot;.
     * @throws java.lang.IllegalArgumentException "bigintTag" is less than 0 or
     * greater than 2^64-1, or "o"'s type is unsupported.
     */
    public static CBORObject FromObjectAndTag(Object o, BigInteger bigintTag) {
      if((bigintTag)==null)throw new NullPointerException("bigintTag");
      if ((bigintTag).signum() < 0) throw new IllegalArgumentException(
        "tag not greater or equal to 0 ("+bigintTag+")");
      if ((bigintTag).compareTo(UInt64MaxValue) > 0) throw new IllegalArgumentException(
        "tag not less or equal to 18446744073709551615 ("+bigintTag+")");
      CBORObject c = FromObject(o);
      if (bigintTag.compareTo(BigInt65536) < 0) {
        // Low-numbered, commonly used tags
        return new CBORObject(c, bigintTag.intValue(), 0);
      } else if (bigintTag.compareTo(BigInteger.valueOf(2)) == 0) {
        return ConvertToBigNum(c, false);
      } else if (bigintTag.compareTo(BigInteger.valueOf(3)) == 0) {
        return ConvertToBigNum(c, true);
      } else if (bigintTag.compareTo(BigInteger.valueOf(4)) == 0) {
        return ConvertToDecimalFrac(c, true);
      } else if (bigintTag.compareTo(BigInteger.valueOf(5)) == 0) {
        return ConvertToDecimalFrac(c, false);
      } else {
        int tagLow = 0;
        int tagHigh = 0;
        byte[] bytes=bigintTag.toByteArray(true);
        for(int i=0;i<Math.min(4,bytes.length);i++){
          int b=((int)bytes[i])&0xFF;
          tagLow=(tagLow|(((int)b)<<(i*8)));
        }
        for(int i=4;i<Math.min(8,bytes.length);i++){
          int b=((int)bytes[i])&0xFF;
          tagHigh=(tagHigh|(((int)b)<<(i*8)));
        }
        return new CBORObject(c, tagLow,tagHigh);
      }
    }
    /**
     * Generates a CBOR object from an arbitrary object and gives the resulting
     * object a tag.
     * @param obValue An arbitrary object.
     * @param smallTag A 32-bit integer that specifies a tag number.
     * @return a CBOR object where the object &quot;value&quot; is converted
     * to a CBOR object and given the tag &quot;smallTag&quot;.
     * @throws java.lang.IllegalArgumentException "smallTag" is less than 0 or "obValue"'s
     * type is unsupported.
     */
    public static CBORObject FromObjectAndTag(Object obValue, int smallTag) {
      if (smallTag < 0) throw new IllegalArgumentException(
        "tag not greater or equal to 0 (" +
        Integer.toString((int)smallTag) + ")");
      CBORObject c = FromObject(obValue);
      if (smallTag == 2 || smallTag == 3) {
        return ConvertToBigNum(c, smallTag == 3);
      }
      if (smallTag == 4 || smallTag == 5) {
        return ConvertToDecimalFrac(c, smallTag == 4);
      }
      return new CBORObject(c, smallTag, 0);
    }
    //-----------------------------------------------------------
    private void AppendClosingTags(StringBuilder sb) {
      CBORObject curobject = this;
      while (curobject.isTagged()) {
        sb.append(')');
        curobject = ((CBORObject)(curobject.item_));
      }
    }
    private void WriteTags(OutputStream s) throws IOException {
      CBORObject curobject = this;
      while (curobject.isTagged()) {
        int low = curobject.tagLow;
        int high = curobject.tagHigh;
        if (high == 0 && (low >> 16) == 0) {
          WritePositiveInt(6, low, s);
        } else if (high == 0) {
          long value = ((long)low) & 0xFFFFFFFFL;
          WritePositiveInt64(6, value, s);
        } else if ((high >> 16) == 0) {
          long value = ((long)low) & 0xFFFFFFFFL;
          long highValue = ((long)high) & 0xFFFFFFFFL;
          value |= (highValue << 32);
          WritePositiveInt64(6, value, s);
        } else {
          byte[] arrayToWrite = new byte[]{(byte)(0xDB),
            (byte)((high>>24)&0xFF),
            (byte)((high>>16)&0xFF),
            (byte)((high>>8)&0xFF),
            (byte)(high&0xFF),
            (byte)((low>>24)&0xFF),
            (byte)((low>>16)&0xFF),
            (byte)((low>>8)&0xFF),
            (byte)(low&0xFF)};
          s.write(arrayToWrite,0,9);
        }
        curobject = ((CBORObject)(curobject.item_));
      }
    }
    private void AppendOpeningTags(StringBuilder sb) {
      CBORObject curobject = this;
      while (curobject.isTagged()) {
        int low = curobject.tagLow;
        int high = curobject.tagHigh;
        if (high == 0 && (low >> 16) == 0) {
          sb.append(Integer.toString((int)low));
        } else {
          BigInteger bi = LowHighToBigInteger(low, high);
          sb.append(CBORUtilities.BigIntToString(bi));
        }
        sb.append('(');
        curobject = ((CBORObject)(curobject.item_));
      }
    }
    private static String TrimDotZero(String str) {
      if (str.length() > 2 && str.charAt(str.length() - 1) == '0' && str.charAt(str.length() - 2) == '.') {
        return str.substring(0,str.length() - 2);
      }
      return str;
    }
    /**
     * Returns this CBOR object in string form. The format is intended to
     * be human-readable, not machine- parsable, and the format may change
     * at any time.
     * @return A text representation of this object.
     */
    @Override public String toString() {
      StringBuilder sb = null;
      String simvalue = null;
      int type = this.getItemType();
      if (this.isTagged()) {
        if (sb == null) {
          if (type == CBORObjectType_TextString) {
            // The default capacity of StringBuilder may be too small
            // for many strings, so set a suggested capacity
            // explicitly
            String str = this.AsString();
            sb = new StringBuilder(Math.min(str.length(), 4096) + 16);
          } else {
            sb = new StringBuilder();
          }
        }
        AppendOpeningTags(sb);
      }
      if (type == CBORObjectType_SimpleValue) {
        if (this.isTrue()) {
          simvalue = "true";
        } else if (this.isFalse()) {
          simvalue = "false";
        } else if (this.isNull()) {
          simvalue = "null";
        } else if (this.isUndefined()) {
          simvalue = "undefined";
        } else {
          if (sb == null) sb = new StringBuilder();
          sb.append("simple(");
          sb.append(Integer.toString(((Integer)this.getThisItem()).intValue()));
          sb.append(")");
        }
        if (simvalue != null) {
          if (sb == null) return simvalue;
          sb.append(simvalue);
        }
      } else if (type == CBORObjectType_Single) {
        float f = ((Float)this.getThisItem()).floatValue();
        if (((f)==Float.NEGATIVE_INFINITY))
          simvalue = ("-Infinity");
        else if (((f)==Float.POSITIVE_INFINITY))
          simvalue = ("Infinity");
        else if (Float.isNaN(f))
          simvalue = ("NaN");
        else
          simvalue = (TrimDotZero(
            Float.toString((float)f)));
        if (sb == null) return simvalue;
        sb.append(simvalue);
      } else if (type == CBORObjectType_Double) {
        double f = ((Double)this.getThisItem()).doubleValue();
        if (((f)==Double.NEGATIVE_INFINITY))
          simvalue = ("-Infinity");
        else if (((f)==Double.POSITIVE_INFINITY))
          simvalue = ("Infinity");
        else if (Double.isNaN(f))
          simvalue = ("NaN");
        else
          simvalue = (TrimDotZero(
            Double.toString((double)f)));
        if (sb == null) return simvalue;
        sb.append(simvalue);
      } else if (type == CBORObjectType_Integer) {
        long v = (((Long)this.getThisItem()).longValue());
        simvalue = (Long.toString((long)v));
        if (sb == null) return simvalue;
        sb.append(simvalue);
      } else if (type == CBORObjectType_BigInteger) {
        simvalue = CBORUtilities.BigIntToString((BigInteger)this.getThisItem());
        if (sb == null) return simvalue;
        sb.append(simvalue);
      } else if (type == CBORObjectType_ByteString) {
        if (sb == null) sb = new StringBuilder();
        sb.append("h'");
        byte[] data = (byte[])this.getThisItem();
        CBORUtilities.ToBase16(sb, data);
        sb.append("'");
      } else if (type == CBORObjectType_TextString) {
        if (sb == null) {
          return "\"" + (this.AsString()) + "\"";
        } else {
          sb.append('\"');
          sb.append(this.AsString());
          sb.append('\"');
        }
      } else if (type == CBORObjectType_ExtendedDecimal) {
        return ToJSONString();
      } else if (type == CBORObjectType_ExtendedFloat) {
        return ToJSONString();
      } else if (type == CBORObjectType_Array) {
        if (sb == null) sb = new StringBuilder();
        boolean first = true;
        sb.append("[");
        for(CBORObject i : AsList()) {
          if (!first) sb.append(", ");
          sb.append(i.toString());
          first = false;
        }
        sb.append("]");
      } else if (type == CBORObjectType_Map) {
        if (sb == null) sb = new StringBuilder();
        boolean first = true;
        sb.append("{");
        Map<CBORObject, CBORObject> map = AsMap();
        for(Map.Entry<CBORObject, CBORObject> entry : map.entrySet()) {
          CBORObject key = entry.getKey();
          CBORObject value = entry.getValue();
          if (!first) sb.append(", ");
          sb.append(key.toString());
          sb.append(": ");
          sb.append(value.toString());
          first = false;
        }
        sb.append("}");
      }
      if (this.isTagged()) {
        AppendClosingTags(sb);
      }
      return sb.toString();
    }
    private static CBORObject ConvertToBigNum(CBORObject o, boolean negative) {
      if (o.getItemType() != CBORObjectType_ByteString)
        throw new CBORException("Byte array expected");
      byte[] data = (byte[])o.getThisItem();
      if (data.length <= 7) {
        long x = 0;
        for (int i = 0; i < data.length; i++) {
          x <<= 8;
          x |= (((long)data[i]) & 0xFF);
        }
        if (negative) x = -x;
        return FromObject(x);
      }
      int neededLength = data.length;
      byte[] bytes;
      boolean extended = false;
      if (((data[0] >> 7) & 1) != 0) {
        // Increase the needed length
        // if the highest bit is set, to
        // distinguish negative and positive
        // values
        neededLength += 1;
        extended = true;
      }
      bytes = new byte[neededLength];
      for (int i = 0; i < data.length; i++) {
        bytes[i] = data[data.length - 1 - i];
        if (negative)
          bytes[i] = (byte)((~((int)bytes[i])) & 0xFF);
      }
      if (extended) {
        if (negative) {
          bytes[bytes.length - 1] = (byte)0xFF;
        } else {
          bytes[bytes.length - 1] = 0;
        }
      }
      BigInteger bi = BigInteger.fromByteArray((byte[])bytes,true);
      return RewrapObject(o, FromObject(bi));
    }
    private static boolean BigIntFits(BigInteger bigint) {
      int sign = bigint.signum();
      if (sign < 0)
        return bigint.compareTo(LowestMajorType1) >= 0;
      else if (sign > 0)
        return bigint.compareTo(UInt64MaxValue) <= 0;
      else
        return true;
    }

    private boolean CanFitInTypeZeroOrOne() {
      switch (this.getItemType()) {
        case CBORObjectType_Integer:
          return true;
          case CBORObjectType_BigInteger: {
            BigInteger bigint = (BigInteger)this.getThisItem();
            return bigint.compareTo(LowestMajorType1) >= 0 &&
              bigint.compareTo(UInt64MaxValue) <= 0;
          }
          case CBORObjectType_Single: {
            float value = ((Float)this.getThisItem()).floatValue();
            return value >= -18446744073709551616.0f &&
              value <= 18446742974197923840.0f; // Highest float less or eq. to ULong.MAX_VALUE
          }
          case CBORObjectType_Double: {
            double value = ((Double)this.getThisItem()).doubleValue();
            return value >= -18446744073709551616.0 &&
              value <= 18446744073709549568.0; // Highest double less or eq. to ULong.MAX_VALUE
          }
          case CBORObjectType_ExtendedDecimal: {
            ExtendedDecimal value = (ExtendedDecimal)this.getThisItem();
            return value.compareTo(ExtendedDecimal.FromBigInteger(LowestMajorType1)) >= 0 &&
              value.compareTo(ExtendedDecimal.FromBigInteger(UInt64MaxValue)) <= 0;
          }
          case CBORObjectType_ExtendedFloat: {
            ExtendedFloat value = (ExtendedFloat)this.getThisItem();
            return value.compareTo(ExtendedFloat.FromBigInteger(LowestMajorType1)) >= 0 &&
              value.compareTo(ExtendedFloat.FromBigInteger(UInt64MaxValue)) <= 0;
          }
        default:
          return false;
      }
    }
    // Wrap a new Object in another one to retain its tags
    private static CBORObject RewrapObject(CBORObject original, CBORObject newObject) {
      if (!original.isTagged())
        return newObject;
      BigInteger[] tags = original.GetTags();
      for (int i = tags.length - 1; i >= 0; i++) {
        newObject = FromObjectAndTag(newObject, tags[i]);
      }
      return newObject;
    }
    private static CBORObject ConvertToDecimalFrac(CBORObject o, Boolean isDecimal) {
      if (o.getItemType() != CBORObjectType_Array)
        throw new CBORException("Big fraction must be an array");
      if (o.size() != 2) // Requires 2 items
        throw new CBORException("Big fraction requires exactly 2 items");
      List<CBORObject> list = o.AsList();
      if (!list.get(0).CanFitInTypeZeroOrOne())
        throw new CBORException("Exponent is too big");
      // check type of mantissa
      if (list.get(1).getItemType() != CBORObjectType_Integer &&
          list.get(1).getItemType() != CBORObjectType_BigInteger)
        throw new CBORException("Big fraction requires mantissa to be an integer or big integer");
      if (list.get(0).isZero()) {
        // Exponent is 0, so return mantissa instead
        return RewrapObject(o, list.get(1));
      }
      if (isDecimal) {
        return RewrapObject(o, new CBORObject(
          CBORObjectType_ExtendedDecimal,
          ExtendedDecimal.Create(list.get(1).AsBigInteger(), list.get(0).AsBigInteger())));
      } else {
        return RewrapObject(o, new CBORObject(
          CBORObjectType_ExtendedFloat,
          ExtendedFloat.Create(list.get(1).AsBigInteger(), list.get(0).AsBigInteger())));
      }
    }
    private static boolean CheckMajorTypeIndex(int type, int index, int[] validTypeFlags) {
      if (validTypeFlags == null || index < 0 || index >= validTypeFlags.length)
        return false;
      if (type < 0 || type > 7)
        return false;
      return (validTypeFlags[index] & (1 << type)) != 0;
    }
    private static CBORObject Read(
      InputStream s,
      int depth,
      boolean allowBreak,
      int allowOnlyType,
      int[] validTypeFlags,
      int validTypeIndex
     ) throws IOException {
      if (depth > 1000)
        throw new CBORException("Too deeply nested");
      int firstbyte = s.read();
      if (firstbyte < 0)
        throw new CBORException("Premature end of data");
      if (firstbyte == 0xFF) {
        if (allowBreak) return null;
        throw new CBORException("Unexpected break code encountered");
      }
      int type = (firstbyte >> 5) & 0x07;
      int additional = (firstbyte & 0x1F);
      int expectedLength = ExpectedLengths[firstbyte];
      // Data checks
      if (expectedLength == -1) // if the head byte is invalid
        throw new CBORException("Unexpected data encountered");
      if (allowOnlyType >= 0) {
        if (allowOnlyType != type) {
          throw new CBORException("Expected major type " +
                                  Integer.toString((int)allowOnlyType) +
                                  ", instead got type " +
                                  Integer.toString(((Integer)type).intValue()));
        }
        if (additional == 31) {
          throw new CBORException("Indefinite-length data not allowed here");
        }
        if (additional >= 28) {
          throw new CBORException("Unexpected data encountered");
        }
      }
      if (validTypeFlags != null) {
        // Check for valid major types if asked
        if (!CheckMajorTypeIndex(type, validTypeIndex, validTypeFlags)) {
          throw new CBORException("Unexpected data type encountered");
        }
      }
      // Check if this represents a fixed Object
      CBORObject fixedObject = FixedObjects[firstbyte];
      if (fixedObject != null)
        return fixedObject;
      // Read fixed-length data
      byte[] data = null;
      if (expectedLength != 0) {
        data = new byte[expectedLength];
        // include the first byte because GetFixedLengthObject
        // will assume it exists for some head bytes
        data[0] = ((byte)firstbyte);
        if (expectedLength > 1 &&
            s.read(data, 1, expectedLength - 1) != expectedLength - 1)
          throw new CBORException("Premature end of data");
        return GetFixedLengthObject(firstbyte, data);
      }
      long uadditional = (long)additional;
      BigInteger bigintAdditional = BigInteger.ZERO;
      boolean hasBigAdditional = false;
      data = new byte[8];
      int lowAdditional=0;
      switch (firstbyte & 0x1F) {
          case 24: {
            int tmp = s.read();
            if (tmp < 0)
              throw new CBORException("Premature end of data");
            lowAdditional = tmp;
            uadditional=lowAdditional;
            break;
          }
          case 25: {
            if (s.read(data, 0, 2) != 2)
              throw new CBORException("Premature end of data");
            lowAdditional = (((int)(data[0] & (int)0xFF)) << 8);
            lowAdditional |= (((int)(data[1] & (int)0xFF)));
            uadditional=lowAdditional;
            break;
          }
          case 26: {
            if (s.read(data, 0, 4) != 4)
              throw new CBORException("Premature end of data");
            uadditional = (((long)(data[0] & (long)0xFF)) << 24);
            uadditional |= (((long)(data[1] & (long)0xFF)) << 16);
            uadditional |= (((long)(data[2] & (long)0xFF)) << 8);
            uadditional |= (((long)(data[3] & (long)0xFF)));
            break;
          }
          case 27: {
            if (s.read(data, 0, 8) != 8)
              throw new CBORException("Premature end of data");
            if((((int)data[0])&0x80)!=0){
              // Won't fit in a signed 64-bit number
              byte[] uabytes=new byte[9];
              uabytes[0]=data[7];
              uabytes[1]=data[6];
              uabytes[2]=data[5];
              uabytes[3]=data[4];
              uabytes[4]=data[3];
              uabytes[5]=data[2];
              uabytes[6]=data[1];
              uabytes[7]=data[0];
              uabytes[8]=0;
              hasBigAdditional=true;
              bigintAdditional=BigInteger.fromByteArray((byte[])uabytes,true);
            } else {
              uadditional = (((long)(data[0] & (long)0xFF)) << 56);
              uadditional |= (((long)(data[1] & (long)0xFF)) << 48);
              uadditional |= (((long)(data[2] & (long)0xFF)) << 40);
              uadditional |= (((long)(data[3] & (long)0xFF)) << 32);
              uadditional |= (((long)(data[4] & (long)0xFF)) << 24);
              uadditional |= (((long)(data[5] & (long)0xFF)) << 16);
              uadditional |= (((long)(data[6] & (long)0xFF)) << 8);
              uadditional |= (((long)(data[7] & (long)0xFF)));
            }
            break;
          }
        default:
          break;
      }
      // The following doesn't check for major types 0 and 1,
      // since all of them are fixed-length types and are
      // handled in the call to GetFixedLengthObject.
      if (type == 2) { // Byte String
        if (additional == 31) {
          // Streaming byte String
          java.io.ByteArrayOutputStream ms=null;
try {
ms=new ByteArrayOutputStream();

            // Requires same type as this one
            int[] subFlags = new int[] { (1 << type) };
            while (true) {
              CBORObject o = Read(s, depth + 1, true, type, subFlags, 0);
              if (o == null) break;//break if the "break" code was read
              data = (byte[])o.getThisItem();
              ms.write(data,0,data.length);
            }
            if (ms.size() > Integer.MAX_VALUE)
              throw new CBORException("Length of bytes to be streamed is bigger than supported");
            data = ms.toByteArray();
            return new CBORObject(
              CBORObjectType_ByteString,
              data);
}
finally {
try { if(ms!=null)ms.close(); } catch(IOException ex){}
}
        } else {
          if (hasBigAdditional) {
            throw new CBORException("Length of " +
                                    CBORUtilities.BigIntToString(bigintAdditional) +
                                    " is bigger than supported");
          } else if (uadditional > Integer.MAX_VALUE) {
            throw new CBORException("Length of " +
                                    Long.toString((long)uadditional) +
                                    " is bigger than supported");
          }
          data = null;
          if (uadditional <= 0x10000) {
            // Simple case: small size
            data = new byte[(int)uadditional];
            if (s.read(data, 0, data.length) != data.length)
              throw new CBORException("Premature end of stream");
          } else {
            byte[] tmpdata = new byte[0x10000];
            int total = (int)uadditional;
            java.io.ByteArrayOutputStream ms=null;
try {
ms=new ByteArrayOutputStream();

              while (total > 0) {
                int bufsize = Math.min(tmpdata.length, total);
                if (s.read(tmpdata, 0, bufsize) != bufsize)
                  throw new CBORException("Premature end of stream");
                ms.write(tmpdata,0,bufsize);
                total -= bufsize;
              }
              data = ms.toByteArray();
}
finally {
try { if(ms!=null)ms.close(); } catch(IOException ex){}
}
          }
          return new CBORObject(
            CBORObjectType_ByteString,
            data);
        }
      } else if (type == 3) { // Text String
        if (additional == 31) {
          // Streaming text String
          StringBuilder builder = new StringBuilder();
          // Requires same type as this one
          int[] subFlags = new int[] { (1 << type) };
          while (true) {
            CBORObject o = Read(s, depth + 1, true, type, subFlags, 0);
            if (o == null) break;//break if the "break" code was read
            builder.append((String)o.getThisItem());
          }
          return new CBORObject(
            CBORObjectType_TextString,
            builder.toString());
        } else {
          if (hasBigAdditional) {
            throw new CBORException("Length of " +
                                    CBORUtilities.BigIntToString(bigintAdditional) +
                                    " is bigger than supported");
          } else if (uadditional > Integer.MAX_VALUE) {
            throw new CBORException("Length of " +
                                    Long.toString((long)uadditional) +
                                    " is bigger than supported");
          }
          StringBuilder builder = new StringBuilder();
          switch (DataUtilities.ReadUtf8(s, (int)uadditional, builder, false)) {
            case -1:
              throw new CBORException("Invalid UTF-8");
            case -2:
              throw new CBORException("Premature end of data");
            default: // No error
              break;
          }
          return new CBORObject(CBORObjectType_TextString, builder.toString());
        }
      } else if (type == 4) { // Array
        List<CBORObject> list = new ArrayList<CBORObject>();
        int vtindex = 1;
        if (additional == 31) {
          while (true) {
            CBORObject o = Read(s, depth + 1, true, -1, validTypeFlags, vtindex);
            if (o == null) break;//break if the "break" code was read
            list.add(o);
            vtindex++;
          }
          return new CBORObject(CBORObjectType_Array, list);
        } else {
          if (hasBigAdditional) {
            throw new CBORException("Length of " +
                                    CBORUtilities.BigIntToString(bigintAdditional) +
                                    " is bigger than supported");
          } else if (uadditional > Integer.MAX_VALUE) {
            throw new CBORException("Length of " +
                                    Long.toString((long)uadditional) +
                                    " is bigger than supported");
          }
          for (long i = 0; i < uadditional; i++) {
            list.add(Read(s, depth + 1, false, -1, validTypeFlags, vtindex));
            vtindex++;
          }
          return new CBORObject(CBORObjectType_Array, list);
        }
      } else if (type == 5) { // Map, type 5
        HashMap<CBORObject, CBORObject> dict=new HashMap<CBORObject, CBORObject>();
        if (additional == 31) {
          while (true) {
            CBORObject key = Read(s, depth + 1, true, -1, null, 0);
            if (key == null) break;//break if the "break" code was read
            CBORObject value = Read(s, depth + 1, false, -1, null, 0);
            dict.put(key,value);
          }
          return new CBORObject(CBORObjectType_Map, dict);
        } else {
          if (hasBigAdditional) {
            throw new CBORException("Length of " +
                                    CBORUtilities.BigIntToString(bigintAdditional) +
                                    " is bigger than supported");
          } else if (uadditional > Integer.MAX_VALUE) {
            throw new CBORException("Length of " +
                                    Long.toString((long)uadditional) +
                                    " is bigger than supported");
          }
          for (long i = 0; i < uadditional; i++) {
            CBORObject key = Read(s, depth + 1, false, -1, null, 0);
            CBORObject value = Read(s, depth + 1, false, -1, null, 0);
            dict.put(key,value);
          }
          return new CBORObject(CBORObjectType_Map, dict);
        }
      } else if (type == 6) { // Tagged item
        CBORObject o;
        if (!hasBigAdditional) {
          if (uadditional == 0) {
            // Requires a text String
            int[] subFlags = new int[] { (1 << 3) };
            o = Read(s, depth + 1, false, -1, subFlags, 0);
          } else if (uadditional == 2 || uadditional == 3) {
            // Big number
            // Requires a byte String
            int[] subFlags = new int[] { (1 << 2) };
            o = Read(s, depth + 1, false, -1, subFlags, 0);
            return ConvertToBigNum(o, uadditional == 3);
          } else if (uadditional == 4 || uadditional == 5) {
            // Requires an array with two elements of
            // a valid type
            int[] subFlags = new int[]{
              (1<<4), // array
              (1<<0)|(1<<1), // exponent
              (1<<0)|(1<<1)|(1<<6) // mantissa
            };
            o = Read(s, depth + 1, false, -1, subFlags, 0);
            return ConvertToDecimalFrac(o, uadditional == 4);
          } else {
            o = Read(s, depth + 1, false, -1, null, 0);
          }
        } else {
          o = Read(s, depth + 1, false, -1, null, 0);
        }
        if (hasBigAdditional) {
          return FromObjectAndTag(o, bigintAdditional);
        } else if (uadditional < 65536) {
          return FromObjectAndTag(
            o, (int)uadditional);
        } else {
          return FromObjectAndTag(
            o, BigInteger.valueOf(uadditional));
        }
      } else {
        throw new CBORException("Unexpected data encountered");
      }
    }
  }

