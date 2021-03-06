package com.upokecenter.util;
/*
Written in 2013 by Peter O.
Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://peteroupc.github.io/CBOR/
 */

  final class Extras {
private Extras(){}
    public static int[] DoubleToIntegers(double dbl) {
      long value = Double.doubleToRawLongBits(dbl);
      return new int[]{
        ((int)(value&0xFFFFFFFFL)),
        ((int)((value>>32)&0xFFFFFFFFL))
      };
    }

    public static double IntegersToDouble(int[] integers) {
      long value=((long)integers[0])&0xFFFFFFFFL;
      value|=((((long)integers[1])&0xFFFFFFFFL)<<32);
      return Double.longBitsToDouble(value);
    }

  }

