import sys
import numpy as np
import pandas as pd

class Calculator:
    """Base calculator class"""
    def compute(self, n):
        raise NotImplementedError

class FactorialCalculator(Calculator):
    """Compute factorial with trace output using numpy/pandas"""
    def compute(self, n):
        if n < 0:
            raise ValueError(f"factorial of negative number ({n}) is undefined")
        arr = np.arange(1, n + 1, dtype=int)
        df = pd.DataFrame({'step': arr, 'partial': np.cumprod(arr)})
        for _, row in df.iterrows():
            print(f" Step {row.step}: -> {row.partial}")
        result = int(df['partial'].iloc[-1]) if n > 0 else 1
        print(f"Factorial of {n} is {result}")
        return result

def main():
    try:
        n = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    except ValueError:
        print("Error: invalid integer input.", file=sys.stderr)
        sys.exit(1)

    print(f"Starting factorial computation for n={n}")
    calc = FactorialCalculator()
    try:
        result = calc.compute(n)
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    print(result)

if __name__ == "__main__":
    main()
