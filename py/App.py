from flask import Flask, render_template, request, jsonify
from pearson import PearsonRegression

app = Flask(__name__)
pr = PearsonRegression()  # Create an instance of your class

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/pearson', methods=['POST'])
def pearson():
    x = request.form.get('x')
    y = request.form.get('y')
    if not x or not y:
        return jsonify({"error": "Both fields must be filled out."}), 400
    try:
        x = float(x)
        y = float(y)
    except ValueError:
        return jsonify({"error": "Both inputs must be valid real numbers."}), 400
    pr.add(x, y)  # Use your class to add data points and calculate results
    results = pr.calculate()
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
