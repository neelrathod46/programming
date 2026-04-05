#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    vector<vector<int>> adjList = {{}, {2,6}, {1,3,4}, {2}, {2,5}, {4,8}, {1,7,9}, {6,8,9}, {5,7}, {6}};
    int visited[10] = {0};
    queue<int> q;
    q.push(1);
    visited[1] = 1;
    while(!q.empty()) {
        int node = q.front();
        q.pop();
        for (int neighbour: adjList[node]) {
            if (!visited[neighbour]) {
                q.push(neighbour);
                visited[neighbour] = 1;
            }
        }
    }
    for (int n: visited) {
        cout << n << " ";
    }
    
    cout << "\n";

}