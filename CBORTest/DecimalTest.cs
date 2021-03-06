/*
Written in 2013 by Peter O.
Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://peteroupc.github.io/CBOR/
 */
using System;
using NUnit.Framework;
using System.Text.RegularExpressions;
using System.Collections.Generic;
using PeterO;
using System.IO;

namespace Test
{
  /// <summary>
  /// Description of DecTest.
  /// </summary>
  ///
  [TestFixture]
  public class DecimalTest
  {
    public static Regex PropertyLine=new Regex(
      "^(\\w+)\\:\\s*(\\S+)",RegexOptions.Compiled);
    public static Regex Quotes=new Regex(
      "^[\\'\\\"]|[\\'\\\"]$",RegexOptions.Compiled);
    public static Regex TestLine=new Regex(
      "^([A-Za-z0-9_]+)\\s+([A-Za-z0-9_\\-]+)\\s+(\\'[^\\']*\\'|\\S+)\\s+(?:(\\S+)\\s+)?(?:(\\S+)\\s+)?->\\s+(\\S+)\\s*(.*)",RegexOptions.Compiled);

    private static TValue GetKeyOrDefault<TKey,TValue>(
      IDictionary<TKey,TValue> dict, TKey key, TValue defaultValue){
      if(!dict.ContainsKey(key))
        return defaultValue;
      return dict[key];
    }

    public void ParseDecTest(string ln, IDictionary<string,string> context){
      Match match;
      match=(!ln.Contains(":")) ? null : PropertyLine.Match(ln);
      if(match!=null && match.Success){
        context[match.Groups[1].ToString().ToLowerInvariant()]=
          match.Groups[2].ToString();
        return;
      }
      match=TestLine.Match(ln);
      if(match.Success){
        string name=match.Groups[1].ToString();
        string op=match.Groups[2].ToString();
        string input1=match.Groups[3].ToString();
        string input2=match.Groups[4].ToString();
        string input3=match.Groups[5].ToString();
        string output=match.Groups[6].ToString();
        string flags=match.Groups[7].ToString();
        input1=Quotes.Replace(input1,"");
        input2=Quotes.Replace(input2,"");
        input3=Quotes.Replace(input3,"");
        output=Quotes.Replace(output,"");
        if(GetKeyOrDefault(context,"extended","1").Equals("0")){
          return;
        }
        bool clamp=GetKeyOrDefault(context,"clamp","0").Equals("1");
        int precision=Convert.ToInt32(context["precision"]);
        int minexponent=Convert.ToInt32(context["minexponent"]);
        int maxexponent=Convert.ToInt32(context["maxexponent"]);
        // Skip tests that take null as input or output;
        // also skip tests that take a hex number format
        if(input1.Contains("#") ||
           input2.Contains("#") ||
           input3.Contains("#") ||
           output.Contains("#")){
          return;
        }
        PrecisionContext ctx=PrecisionContext.ForPrecision(precision)
          .WithExponentClamp(clamp).WithExponentRange(
            (BigInteger)minexponent,(BigInteger)maxexponent);
        string rounding=context["rounding"];
        if(rounding.Equals("half_up"))
          ctx=ctx.WithRounding(Rounding.HalfUp);
        if(rounding.Equals("half_down"))
          ctx=ctx.WithRounding(Rounding.HalfDown);
        if(rounding.Equals("half_even"))
          ctx=ctx.WithRounding(Rounding.HalfEven);
        if(rounding.Equals("up"))
          ctx=ctx.WithRounding(Rounding.Up);
        if(rounding.Equals("down"))
          ctx=ctx.WithRounding(Rounding.Down);
        if(rounding.Equals("ceiling"))
          ctx=ctx.WithRounding(Rounding.Ceiling);
        if(rounding.Equals("floor"))
          ctx=ctx.WithRounding(Rounding.Floor);
        if(rounding.Equals("05up"))
          ctx=ctx.WithRounding(Rounding.ZeroFiveUp);
        ctx=ctx.WithBlankFlags();
        ExtendedDecimal d1=null,d2=null,d2a=null;
        if(!op.Equals("toSci") && !op.Equals("toEng")){
          d1=(String.IsNullOrEmpty(input1)) ? null :
            ExtendedDecimal.FromString(input1);
          d2=(String.IsNullOrEmpty(input2)) ? null :
            ExtendedDecimal.FromString(input2);
          d2a=(String.IsNullOrEmpty(input3)) ? null :
            ExtendedDecimal.FromString(input3);
        }
        ExtendedDecimal d3=null;
        if(op.Equals("multiply"))d3=d1.Multiply(d2,ctx);
        else if(op.Equals("toSci")){ /* handled below */ }
        else if(op.Equals("toEng")){ /* handled below */ }
        else if(op.Equals("fma"))d3=d1.MultiplyAndAdd(d2,d2a,ctx);
        else if(op.Equals("min"))d3=ExtendedDecimal.Min(d1,d2,ctx);
        else if(op.Equals("max"))d3=ExtendedDecimal.Max(d1,d2,ctx);
        else if(op.Equals("minmag"))d3=ExtendedDecimal.MinMagnitude(d1,d2,ctx);
        else if(op.Equals("maxmag"))d3=ExtendedDecimal.MaxMagnitude(d1,d2,ctx);
        else if(op.Equals("compare"))d3=d1.CompareToWithContext(d2,ctx);
        else if(op.Equals("comparesig"))d3=d1.CompareToSignal(d2,ctx);
        else if(op.Equals("subtract"))d3=d1.Subtract(d2,ctx);
        else if(op.Equals("tointegral"))d3=d1.RoundToIntegralNoRoundedFlag(ctx);
        else if(op.Equals("tointegralx"))d3=d1.RoundToIntegralExact(ctx);
        else if(op.Equals("divideint"))d3=d1.DivideToIntegerZeroScale(d2,ctx);
        else if(op.Equals("divide"))d3=d1.Divide(d2,ctx);
        else if(op.Equals("remainder"))d3=d1.Remainder(d2,ctx);
        else if(op.Equals("exp")){
          d3=d1.Exp(ctx);
        }
        //else if(op.Equals("ln")){
        //Console.WriteLine(ln);
        // d3=d1.Ln(ctx);
        //}
        else if(op.Equals("squareroot"))d3=d1.SquareRoot(ctx);
        else if(op.Equals("remaindernear"))d3=d1.RemainderNear(d2,ctx);
        else if(op.Equals("nexttoward"))d3=d1.NextToward(d2,ctx);
        else if(op.Equals("nextplus"))d3=d1.NextPlus(ctx);
        else if(op.Equals("nextminus"))d3=d1.NextMinus(ctx);
        else if(op.Equals("copy"))d3=d1;
        else if(op.Equals("abs"))d3=d1.Abs(ctx);
        else if(op.Equals("reduce"))d3=d1.Reduce(ctx);
        else if(op.Equals("quantize"))d3=d1.Quantize(d2,ctx);
        else if(op.Equals("add"))d3=d1.Add(d2,ctx);
        else if(op.Equals("minus"))d3=d1.Negate(ctx);
        else if(op.Equals("apply"))d3=d1.RoundToPrecision(ctx);
        else if(op.Equals("plus"))d3=d1.Plus(ctx);
        else return;
        if(flags.Contains("Invalid_context"))return;
        bool invalid=(flags.Contains("Division_impossible") ||
                      flags.Contains("Division_undefined") ||
                      flags.Contains("Invalid_operation"));
        bool divzero=(flags.Contains("Division_by_zero"));
        int expectedFlags=0;
        if(flags.Contains("Inexact") || flags.Contains("inexact"))
          expectedFlags|=PrecisionContext.FlagInexact;
        if(flags.Contains("Subnormal"))expectedFlags|=PrecisionContext.FlagSubnormal;
        if(flags.Contains("Rounded") || flags.Contains("rounded"))
          expectedFlags|=PrecisionContext.FlagRounded;
        if(flags.Contains("Underflow"))expectedFlags|=PrecisionContext.FlagUnderflow;
        if(flags.Contains("Overflow"))expectedFlags|=PrecisionContext.FlagOverflow;
        if(flags.Contains("Clamped"))expectedFlags|=PrecisionContext.FlagClamped;
        bool conversionError=flags.Contains("Conversion_syntax");
        if(invalid)expectedFlags|=PrecisionContext.FlagInvalid;
        if(divzero)expectedFlags|=PrecisionContext.FlagDivideByZero;
        if(op.Equals("toSci")){
          try {
            d1=ExtendedDecimal.FromString(input1,ctx);
            Assert.IsTrue(!conversionError,"Expected no conversion error");
            Assert.AreEqual(output,d1.ToString(),input1);
          } catch(FormatException){
            Assert.IsTrue(conversionError,"Expected conversion error");
          }
        } else if(op.Equals("toEng")){
          try {
            d1=ExtendedDecimal.FromString(input1,ctx);
            Assert.IsTrue(!conversionError,"Expected no conversion error");
            Assert.AreEqual(output,d1.ToEngineeringString(),input1);
          } catch(FormatException){
            Assert.IsTrue(conversionError,"Expected conversion error");
          }
        } else {
          TestCommon.AssertDecFrac(d3,output,name);
        }
        TestCommon.AssertFlags(expectedFlags,ctx.Flags,name);
      }
    }

    static string TestPath="..\\..\\..\\.settings";

    private static void PrintTime(System.Diagnostics.Stopwatch sw){
      Console.WriteLine("Elapsed time: {0} s",sw.ElapsedMilliseconds/1000.0);
    }

    [Test]
    public void TestPi(){
      System.Diagnostics.Stopwatch sw=new System.Diagnostics.Stopwatch();
      sw.Start();
      ExtendedDecimal.PI(PrecisionContext.ForPrecision(1000)).ToString();
      sw.Stop();
      PrintTime(sw);
    }

    [Test]
    public void TestParser(){
      long failures=0;
      if(!Directory.Exists(TestPath))
        return;
      for(int i=0;i<1;i++){
        foreach(var f in Directory.GetFiles(TestPath)){
          if(!Path.GetFileName(f).Contains(".decTest"))continue;
          if(Path.GetFileName(f).Contains("ln"))continue;
          Console.WriteLine("//"+f);
          IDictionary<string,string> context=new Dictionary<string,string>();
          using(StreamReader w=new StreamReader(f)){
            while(!w.EndOfStream){
              string ln=w.ReadLine();
              {
                try {
                  TextWriter oldOut=Console.Out;
                  try {
                    //  Console.SetOut(TextWriter.Null);
                    ParseDecTest(ln,context);
                  } catch(Exception){
                    Console.SetOut(oldOut);
                    ParseDecTest(ln,context);
                  } finally {
                    Console.SetOut(oldOut);
                  }
                } catch(Exception ex){
                  Console.WriteLine(ln);
                  Console.WriteLine(ex.Message);
                  Console.WriteLine(ex.StackTrace);
                  failures++;
                  //throw;
                }
              }
            }
          }
        }
      }
      if(failures>0){
        Assert.Fail(failures+" failure(s)");
      }
    }
  }
}

