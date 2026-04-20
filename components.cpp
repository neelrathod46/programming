#include <iostream>
#include <vector>
using namespace std;

vector<int> dfs(int node, vector<vector<int>> &adjList, vector<int> &visited);
int main() {
    vector<vector<int>> adjList = {{}, {2,6}, {1,3,4}, {2}, {2,5}, {4,8}, {1,7,9}, {6,8,9}, {5,7}, {6}};
    vector<int> visited(10, 0);
    int components{0};
    for (int node = 0; node < visited.size(); node++) {
        if (!visited[node]) {
            components++;    
            dfs(node, adjList, visited);
        }
    }
    cout << "Components: " << components << "\n";
}

vector<int> dfs(int node, vector<vector<int>> &adjList, vector<int> &visited) {
    for (int neighbour: adjList[node]) {
        if (!visited[neighbour]) {
            visited[neighbour] = 1;
            dfs(node, adjList, visited);
        }
    }
}