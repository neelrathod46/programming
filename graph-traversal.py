import json
adjlist = list(map(lambda element:json.loads(element), input().split(', ')))
print(adjlist)
visited = [0] * 10
print(visited)

# Breadth-First Search
starting_node = 1
visited[starting_node] = 1
queue = [starting_node]
while(queue != []):
	for neighbour in adjlist[queue.pop()]:
		if (visited[neighbour] == 0):
			visited[neighbour] = 1
			queue.insert(0, neighbour)
print(visited)
