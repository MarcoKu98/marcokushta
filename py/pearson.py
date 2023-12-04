import math

class PearsonRegression:
    def __init__(self):
        self.data = []

    def add(self, x, y):
        if not isinstance(x, (int, float)) or not isinstance(y, (int, float)):
            return "Error: Both inputs must be valid real numbers."
        self.data.append((x, y))
        return f"Data point ({x}, {y}) added."

    def calculate(self):
        if len(self.data) < 2:
            return "Error: At least two data points are required."
        x = [i[0] for i in self.data]
        y = [i[1] for i in self.data]
        mean_x = sum(x) / len(x)
        mean_y = sum(y) / len(y)
        std_x = math.sqrt(sum((i - mean_x) ** 2 for i in x) / len(x))
        std_y = math.sqrt(sum((i - mean_y) ** 2 for i in y) / len(y))
        correlation = sum((x[i] - mean_x) * (y[i] - mean_y) for i in range(len(x))) / (len(x) * std_x * std_y)
        return {
            "mean_x": mean_x,
            "mean_y": mean_y,
            "std_x": std_x,
            "std_y": std_y,
            "correlation": correlation
        }
