def simplify(expr):
	print("".join(expr))
	expr = list(expr)
	count = 0
	isFirst = True
	should_restart = True
	while (should_restart):
		should_restart = False
		for i in range(len(expr)):
			if (expr[i] == '('):
				if (count == 0):
					start = i
					isFirst = False
				count += 1
			elif (expr[i] == ')'):
				if (count == 1):
					end = i
					expr.insert(start, simplify(expr[start+1:end])[0])
					del expr[start+1:end+2]
					should_restart = True
					break
				count -= 1

	return solve(expr)

def solve(sub_expr):
	print(sub_expr)
	#solve exponents first
	should_restart = True
	while (should_restart):
		should_restart = False
		for i in range(len(sub_expr)-1, 0, -1):
			if (sub_expr[i] == '^'):
				ans = int(sub_expr[i-1])**int(sub_expr[i+1])
				del sub_expr[i-1:i+2]
				sub_expr.insert(i-1, ans)
				print(sub_expr)
				should_restart = True
				break

	#then * and /
	should_restart = True
	while(should_restart):
		should_restart = False
		for i in range(len(sub_expr)):
			if (sub_expr[i] == '/'):
				ans = int(sub_expr[i-1])/int(sub_expr[i+1])
				del sub_expr[i-1:i+2]
				sub_expr.insert(i-1, ans)
				print(sub_expr)
				should_restart = True
				break

			elif (sub_expr[i] == '*'):
				ans = int(sub_expr[i-1])*int(sub_expr[i+1])
				del sub_expr[i-1:i+2]
				sub_expr.insert(i-1, ans)
				print(sub_expr)
				should_restart = True
				break
	# then + and -
	should_restart = True
	while(should_restart):
		should_restart = False
		for i in range(len(sub_expr)):
			if (sub_expr[i] == '+'):
				ans = int(sub_expr[i-1])+int(sub_expr[i+1])
				del sub_expr[i-1:i+2]
				sub_expr.insert(i-1, ans)
				print(sub_expr)
				should_restart = True
				break

			elif (sub_expr[i] == '-'):
				ans = int(sub_expr[i-1])-int(sub_expr[i+1])
				del sub_expr[i-1:i+2]
				sub_expr.insert(i-1, ans)
				print(sub_expr)
				should_restart = True
				break

	return sub_expr

import time
start = time.perf_counter()

expr = "2*(2+3)-2^2"
result = simplify(list(expr))

end = time.perf_counter()
print(f"2*(2+3)-2^2 = {result[0]}: {end-start:.6f} seconds")

