import time
start = time.time()
def shuntya(expression):
    precedence = {'+':1, '-':1, '*':2, '/':2, '^': 3}
    prev = 0
    operators = []
    final = []
    for i in expression:
        if i in '+-*/^':
            if precedence[i]> prev:
                operators.append(i)
                prev = precedence[i]
            else:
                for element in operators:
                    if element !='(':
                        final.append(element)
                    operators.remove(element)
                operators.append(i)
        elif i == '(':
            operators.append(i)
        elif i == ')':
            for j in operators[::-1]:
                if j != '(':
                    final.append(j)
                else:
                    operators.remove(j)
                    break
        else:
            final.append(i)
    for rest in operators[::-1]:
        final.append(rest)
    print(f"postfix: {"".join(final)}")
    return  "".join(final)
def solving(expr):
    answer = []
    for symbol in expr:
        if symbol.isdigit():
            answer.append(int(symbol))
        else:
            b = answer.pop()
            a = answer.pop()
            if symbol == '+':
                answer.append(a + b)
            elif symbol == '-':
                answer.append(a - b)
            elif symbol == '*':
                answer.append(a * b)
            elif symbol == '/':
                answer.append(a / b)
            elif symbol == '^':
                answer.append(a ** b)
    return answer[0]
exp = '2+4-6*9^2'
expr = shuntya(exp)
result = solving(expr)
print("Result:", result)
end = time.time()
print(f"Runtime is: {end-start:.6f} seconds")