# %%
from fractions import Fraction
import itertools
from typing import Self

# sum_q a_q * eps^q
CoefficientMap = dict[Fraction, float]


class HyperReal:
    def __init__(self, coeffs: CoefficientMap):
        self.coeffs = coeffs

    def normalize(self) -> Self:
        """
        Returns a new HyperReal instance with zero coefficients removed.

        >>> HyperReal({Fraction(1, 1): 2.0, Fraction(0, 1): 0.0}).normalize()
        HyperReal({Fraction(1, 1): 2.0})
        """
        return HyperReal({k: v for k, v in self.coeffs.items() if v != 0})

    def is_unlimited(self) -> bool:
        """
        Checks if the HyperReal instance is unlimited.

        >>> HyperReal({Fraction(-1, 1): 2.0}).is_unlimited()
        True
        >>> HyperReal({Fraction(1, 1): 2.0}).is_unlimited()
        False
        """
        return any(k < 0 for k in self.coeffs.keys())

    def is_limited(self) -> bool:
        """
        Checks if the HyperReal instance is limited.

        >>> HyperReal({Fraction(-1, 1): 2.0}).is_limited()
        False
        >>> HyperReal({Fraction(1, 1): 2.0}).is_limited()
        True
        """
        return not self.is_unlimited()

    def is_infinitesimal(self) -> bool:
        """
        Checks if the HyperReal instance is infinitesimal.

        >>> HyperReal({Fraction(1, 1): 2.0}).is_infinitesimal()
        True
        >>> HyperReal({Fraction(0, 1): 2.0}).is_infinitesimal()
        False
        """
        return all(k > 0 for k in self.coeffs.keys())

    def std_part(self) -> float | None:
        """
        Returns the standard part of the HyperReal instance if it is limited, otherwise None.

        >>> HyperReal({Fraction(0, 1): 2.0}).std_part()
        2.0
        >>> HyperReal({Fraction(-1, 1): 2.0}).std_part()
        """
        if self.is_unlimited():
            return None
        else:
            return self.coeffs[Fraction(0, 1)]

    def __add__(self, other: Self) -> Self:
        """
        Adds two HyperReal instances.

        >>> HyperReal({Fraction(1, 1): 2.0}) + HyperReal({Fraction(1, 1): 3.0})
        HyperReal({Fraction(1, 1): 5.0})
        """
        return HyperReal(
            {
                k: self.coeffs.get(k, 0) + other.coeffs.get(k, 0)
                for k in self.coeffs.keys() | other.coeffs.keys()
            }
        )

    def __invert__(self) -> Self:
        """
        Placeholder for inversion operation.
        """
        out = HyperReal(self.coeffs.copy())
        return out

    def __sub__(self, other: Self) -> Self:
        """
        Subtracts one HyperReal instance from another.

        >>> HyperReal({Fraction(1, 1): 5.0}) - HyperReal({Fraction(1, 1): 3.0})
        HyperReal({Fraction(1, 1): 2.0})
        """
        return self + (-other)

    def __mul__(self, other: Self) -> Self:
        """
        Multiplies two HyperReal instances.

        >>> HyperReal({Fraction(1, 1): 2.0}) * HyperReal({Fraction(1, 1): 3.0})
        HyperReal({Fraction(2, 1): 6.0})
        """
        result = {}
        for (k1, v1), (k2, v2) in itertools.product(
            self.coeffs.items(), other.coeffs.items()
        ):
            k = k1 + k2
            result[k] = result.get(k, 0) + v1 * v2
        return HyperReal(result)

    def __truediv__(self, other: Self) -> Self:
        """
        Divides one HyperReal instance by another.

        >>> HyperReal({Fraction(1, 1): 6.0}) / HyperReal({Fraction(1, 1): 2.0})
        HyperReal({Fraction(0, 1): 3.0})
        """
        result = {}
        for k1, v1 in self.coeffs.items():
            for k2, v2 in other.coeffs.items():
                if k2 == 0:
                    raise ZeroDivisionError("Cannot divide by zero")
                k = k1 - k2
                result[k] = result.get(k, 0) + v1 / v2
        return HyperReal(result)

    def __pow__(self, n: int) -> Self:
        """
        Raises a HyperReal instance to the power of n.

        >>> HyperReal({Fraction(1, 1): 2.0}) ** 2
        HyperReal({Fraction(2, 1): 4.0})
        """
        out = self
        for _ in range(abs(n - 1)):
            out *= self
        return out

    def __neg__(self) -> Self:
        """
        Negates a HyperReal instance.

        >>> -HyperReal({Fraction(1, 1): 2.0})
        HyperReal({Fraction(1, 1): -2.0})
        """
        return HyperReal({k: -v for k, v in self.coeffs.items()})

    def __eq__(self, other: Self) -> bool:
        """
        Checks if two HyperReal instances are equal.

        >>> HyperReal({Fraction(1, 1): 2.0}) == HyperReal({Fraction(1, 1): 2.0})
        True
        >>> HyperReal({Fraction(1, 1): 2.0}) == HyperReal({Fraction(1, 1): 3.0})
        False
        """
        return self.coeffs == other.coeffs

    def __lt__(self, other: Self) -> bool:
        """
        Checks if one HyperReal instance is less than another.

        >>> HyperReal({Fraction(1, 1): 2.0}) < HyperReal({Fraction(2, 1): 3.0})
        True
        """
        self_min = min(self.coeffs.keys())
        other_min = min(other.coeffs.keys())
        return self_min < other_min

    def __le__(self, other: Self) -> bool:
        """
        Checks if one HyperReal instance is less than or equal to another.
        """
        ...

    def __gt__(self, other: Self) -> bool:
        """
        Checks if one HyperReal instance is greater than another.
        """
        ...

    def __ge__(self, other: Self) -> bool:
        """
        Checks if one HyperReal instance is greater than or equal to another.
        """
        ...

    def __str__(self) -> str:
        return " + ".join(f"{v}ε^{k}" for k, v in self.coeffs.items())

    def __repr__(self) -> str:
        return str(self)
        # return f"HyperReal({self.coeffs})"

    @classmethod
    def parse(cls: type[Self], s: str) -> Self:

        # 1 + 7e
        # repr: e for epsilon
        # if no e, then repr is e^0
        # split on sums
        # (1 + e) * (1 + e^2)
        terms = [t.strip() for t in s.split("+")]

        def process_term(term: str) -> tuple[Fraction, float]:
            """
            Processes a term and returns its power and coefficient.

            >>> process_term("3")
            (Fraction(0, 1), 3.0)
            >>> process_term("2e")
            (Fraction(1, 1), 2.0)
            >>> process_term("4e^3")
            (Fraction(3, 1), 4.0)
            """
            if "e" not in term:
                return Fraction(0, 1), float(term)
            if "^" not in term:
                coeff = term.replace("e", "")
                return Fraction(1, 1), float(coeff)
            coeff_with_e, power = term.split("^")
            power = Fraction(power)
            coeff = float(coeff_with_e.replace("e", ""))
            return power, coeff

        return cls(
            {power: coeff for power, coeff in (process_term(term) for term in terms)}
        )


# 7e
# (1) + (7e)
# (1 + 7e) * (e^2 + 2.5e^3)
if __name__ == "__main__":
    print(f'{HyperReal.parse("1 + 7e^2 + 2.5e^3")=}')
    print(f'{HyperReal.parse("1 + 7e")=}')
    print(f'{HyperReal.parse("1 + 7e^2 + 2.5e^3") * HyperReal.parse("1 + 7e")=}')
    # print(f'{HyperReal.parse("1 + 7e^2 + 2.5e^3") / HyperReal.parse("1 + 7e")=}')
    print(f'{HyperReal.parse("1 + 7e") ** 2=}')
    print(f'{-HyperReal.parse("1 + 7e^2 + 2.5e^3")=}')

# %%
