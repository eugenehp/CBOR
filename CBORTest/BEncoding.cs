/*
Written in 2013 by Peter Occil.
Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://peteroupc.github.io/CBOR/
 */
using System;
using System.Text;
using System.Globalization;
using System.Collections.Generic;
using System.IO;
namespace PeterO {
    /// <summary> Contains methods for reading and writing objects represented
    /// in BEncode, a serialization format used in the BitTorrent protocol.
    /// For more information, see: https://wiki.theory.org/BitTorrentSpecification#bencoding
    /// This class accepts BEncoded strings in UTF-8, and outputs BEncoded
    /// strings in UTF-8. This class also demonstrates how CBORObject supports
    /// predefined serialization formats. </summary>
    /// <returns>A CBORObject object.</returns>
    /// <param name='stream'>A readable data stream.</param>
  public static class BEncoding {
    private static void writeUtf8(string s, Stream stream) {
      if (DataUtilities.WriteUtf8(s, stream, false) != 0)
        throw new CBORException("invalid surrogate");
    }
    private static CBORObject readDictionary(Stream stream) {
      CBORObject obj = CBORObject.NewMap();
      while (true) {
        int c = stream.ReadByte();
        if (c == 'e') {
          break;
        }
        CBORObject s = readString(stream, (char)c);
        CBORObject o = readObject(stream, false);
        obj[s] = o;
      }
      return obj;
    }
    private static CBORObject readInteger(Stream stream) {
      StringBuilder builder = new StringBuilder();
      bool start = true;
      while (true) {
        int c = stream.ReadByte();
        if (c < 0)
          throw new CBORException("Premature end of data");
        if (c >= (int)'0' && c <= (int)'9') {
          builder.Append((char)c);
          start = false;
        } else if (c == (int)'e') {
          break;
        } else if (start && c == '-') {
          start = false;
          builder.Append((char)c);
        } else {
          throw new CBORException("Invalid integer encoding");
        }
      }
      return CBORDataUtilities.ParseJSONNumber(
        builder.ToString(), true, false, true);
    }
    private static CBORObject readList(Stream stream) {
      CBORObject obj = CBORObject.NewArray();
      while (true) {
        CBORObject o = readObject(stream, true);
        if (o == null) break;// 'e' was read
        obj.Add(o);
      }
      return obj;
    }
    public static CBORObject Read(Stream stream) {
      return readObject(stream, false);
    }
    private static CBORObject readObject(Stream stream, bool allowEnd) {
      int c = stream.ReadByte();
      if (c == 'd')
        return readDictionary(stream);
      else if (c == 'l')
        return readList(stream);
      else if (allowEnd && c == 'e')
        return null;
      else if (c == 'i')
        return readInteger(stream);
      else if (c >= '0' && c <= '9') {
        return readString(stream, (char)c);
      } else {
        throw new CBORException("Object expected");
      }
    }
    private static CBORObject readString(Stream stream, char firstChar) {
      StringBuilder builder = new StringBuilder();
      if (firstChar < (int)'0' && firstChar > (int)'9') {
        throw new CBORException("Invalid integer encoding");
      } else {
        builder.Append(firstChar);
      }
      while (true) {
        int c = stream.ReadByte();
        if (c < 0)
          throw new CBORException("Premature end of data");
        if (c >= (int)'0' && c <= (int)'9') {
          builder.Append((char)c);
        } else if (c == (int)':') {
          break;
        } else {
          throw new CBORException("Invalid integer encoding");
        }
      }
      CBORObject number = CBORDataUtilities.ParseJSONNumber(
        builder.ToString(), true, true, true);
      int length = 0;
      try {
        length = number.AsInt32();
      } catch (ArithmeticException ex) {
        throw new CBORException("Length too long", ex);
      }
      builder = new StringBuilder();
      switch (DataUtilities.ReadUtf8(stream, length, builder, false)) {
        case -2:
          throw new CBORException("Premature end of data");
        case -1:
          throw new CBORException("Invalid UTF-8");
        default:
          break;
      }
      return CBORObject.FromObject(builder.ToString());
    }
    public static void Write(CBORObject obj, Stream stream) {
      if (obj.Type == CBORType.Number) {
        stream.WriteByte(unchecked((byte)((byte)'i')));
        writeUtf8(obj.AsBigInteger().ToString(), stream);
        stream.WriteByte(unchecked((byte)((byte)'e')));
      } else if (obj.Type == CBORType.TextString) {
        string s = obj.AsString();
        long length = DataUtilities.GetUtf8Length(s, false);
        if (length < 0)
          throw new CBORException("invalid string");
        writeUtf8(Convert.ToString((long)length, CultureInfo.InvariantCulture), stream);
        stream.WriteByte(unchecked((byte)((byte)':')));
        writeUtf8(s, stream);
      } else if (obj.Type == CBORType.Map) {
        bool hasNonStringKeys = false;
        foreach (CBORObject key in obj.Keys) {
          if (key.Type != CBORType.TextString) {
            hasNonStringKeys = true;
            break;
          }
        }
        if (hasNonStringKeys) {
          var sMap = new Dictionary<String, CBORObject>();
          // Copy to a map with String keys, since
          // some keys could be duplicates
          // when serialized to strings
          foreach (CBORObject key in obj.Keys) {
            CBORObject value = obj[key];
            string str = (key.Type == CBORType.TextString) ?
              key.AsString() : key.ToJSONString();
            sMap[str] = value;
          }
          stream.WriteByte(unchecked((byte)((byte)'d')));
          foreach (KeyValuePair<string, CBORObject> entry in sMap) {
            string key = entry.Key;
            CBORObject value = entry.Value;
            long length = DataUtilities.GetUtf8Length(key, false);
            if (length < 0)
              throw new CBORException("invalid string");
            writeUtf8(Convert.ToString((long)length, CultureInfo.InvariantCulture), stream);
            stream.WriteByte(unchecked((byte)((byte)':')));
            writeUtf8(key, stream);
            Write(value, stream);
          }
          stream.WriteByte(unchecked((byte)((byte)'e')));
        } else {
          stream.WriteByte(unchecked((byte)((byte)'d')));
          foreach (CBORObject key in obj.Keys) {
            string str = key.AsString();
            long length = DataUtilities.GetUtf8Length(str, false);
            if (length < 0)
              throw new CBORException("invalid string");
            writeUtf8(Convert.ToString((long)length, CultureInfo.InvariantCulture), stream);
            stream.WriteByte(unchecked((byte)((byte)':')));
            writeUtf8(str, stream);
            Write(obj[key], stream);
          }
          stream.WriteByte(unchecked((byte)((byte)'e')));
        }
      } else if (obj.Type == CBORType.Array) {
        stream.WriteByte(unchecked((byte)((byte)'l')));
        for (int i = 0; i < obj.Count; i++) {
          Write(obj[i], stream);
        }
        stream.WriteByte(unchecked((byte)((byte)'e')));
      } else {
        string str = obj.ToJSONString();
        long length = DataUtilities.GetUtf8Length(str, false);
        if (length < 0)
          throw new CBORException("invalid string");
        writeUtf8(Convert.ToString((long)length, CultureInfo.InvariantCulture), stream);
        stream.WriteByte(unchecked((byte)((byte)':')));
        writeUtf8(str, stream);
      }
    }
  }
}
