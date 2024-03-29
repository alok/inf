# %%
    def normalize(self)->Self:
        return HyperReal({k: v for k, v in self.coeffs.items() if v != 0})
    def is_unlimited(self) -> bool:
        return any(k < 0 for k in self.coeffs.keys())

    def is_limited(self) -> bool:
        return not self.is_unlimited()

    def is_infinitesimal(self) -> bool:
        return all(k > 0 for k in self.coeffs.keys())

    def std_part(self) -> float | None:
        if self.is_unlimited():
            return None
        else:
            return self.coeffs[0]

    def __add__(self, other: Self) -> Self:
        return HyperReal({k: self.coeffs.get(k, 0) + other.coeffs.get(k, 0) for k in self.coeffs.keys() | other.coeffs.keys()})
    def __invert__(self) -> Self:
        out = HyperReal(self.coeffs.copy())
        ...
    def __sub__(self, other: Self) -> Self:
        return self + (-other)
    def __mul__(self, other: Self) -> Self:
        result = {}
        for (k1, v1), (k2,v2) in itertools.product(self.coeffs.items(), other.coeffs.items()):
            k = k1 + k2
            result[k] = result.get(k, 0) + v1 * v2
        return HyperReal(result)
    #TODO write test
    def __truediv__(self, other: Self) -> Self:
        result = {}
        for (k1, v1) in self.coeffs.items():
            for (k2, v2) in other.coeffs.items():
                if k2 == 0:
                    raise ZeroDivisionError("Cannot divide by zero")
                k = k1 - k2
                result[k] = result.get(k, 0) + v1 / v2
        return HyperReal(result)
    
    def __pow__(self, n:int) -> Self:
        #TODO extend to limited complex numbers
        out = self
        for _ in range(abs(n-1)):
            out *= self
        return out
    def __neg__(self) -> Self:
        return HyperReal({k: -v for k, v in self.coeffs.items()})
    def __abs__(self) -> Self:
        ...
    def __eq__(self, other: Self) -> bool:
        return self.coeffs == other.coeffs
    def __lt__(self, other: Self) -> bool:
        self_min = min(self.coeffs.keys())
        other_min = min(other.coeffs.keys())
        return self_min < other_min
        
    def __le__(self, other: Self) -> bool:
        ...
    def __gt__(self, other: Self) -> bool:
        ...
    def __ge__(self, other: Self) -> bool:
        ...
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
