#include <iostream>
#include <vector>
using namespace std;

void dfs(int node, vector<vector<int>> &adjList, vector<int> &visited);

int main() {
  vector<vector<int>> adjList = {{}, {2,6}, {1,3,4}, {2}, {2,5}, {4,8}, {1,7,9}, {6,8,9}, {5,7}, {6}};
  vector<int> visited(10, 0);
  dfs(1, adjList, visited);
  for (int n: visited) cout << n << " ";
  cout << "\n";
}

void dfs(int node, vector<vector<int>> &adjList, vector<int> &visited) {
  for (int neighbour: adjList[node]) {
    if(!visited[neighbour]) {
      visited[neighbour] = 1;
      cout << "Node: " << neighbour << " visited: ";
      for (int n: visited) cout << n << " ";
      cout << "\n";
      dfs(neighbour, adjList, visited);
    }

  }
}
