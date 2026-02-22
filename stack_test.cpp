#include <iostream>
using namespace std;

#define EXPR_LENGTH 50
char AE[EXPR_LENGTH];

int simplify(char* AE);
int solve(char* subAE);
int pow(int num1, int num2);

int main() {
    for (int i = 0; i < EXPR_LENGTH; i++) {
        AE[i] = '#';
    }
    //AE = "1+(2*3)";
    AE[0] = '1';
    AE[1] = '+';
    AE[2] = '(';
    AE[3] = '2';
    AE[4] = '*';
    AE[5] = '3';
    AE[6] = '/';
    AE[7] = '2';
    AE[8] = ')';
    //cin >> AE;

    cout << simplify(AE) - '0';


    return 0;
}


int simplify(char* AE) {
    int count = 0, start = 0, end = 0;
    bool isFirst = true;
    for (int i = 0; i < EXPR_LENGTH; i++) {
        if (AE[i] == '(') {
            if (count == 0) {
                start = i;
                isFirst = false;
            }
            count++;
        }
        else if (AE[i] == ')') {
            count--;
            if (count == 0) {
                end = i;
                break;
            }
        }
        else if (AE[i] == '#') break;
        //cout << AE[i];
    }

    if (isFirst) {
        int result = solve(AE);
        return result;
    }
    else {
        char subAE[EXPR_LENGTH];
        int j = 0;
        for (int i = start + 1; i < end; i++) {
            subAE[j++] = AE[i];
        }
        subAE[j] = '#';
        AE[start] = simplify(subAE);
        int length = end - start;
        for (int i = end + 1; i < EXPR_LENGTH; i++) {
            AE[i - length] = AE[i];
        }

        // Replace garbage values at the end with #
        for (int i = EXPR_LENGTH - length; i < EXPR_LENGTH; i++) {
            AE[i] = '#';
        }

        return solve(AE);
    }
}

int solve(char* subAE) {
    int end = 0;
    while (subAE[end] != '#') {
        end++;
    }
    for (int i = end; i > -1; i--) {
        if (subAE[i] == '^') {
            subAE[i - 1] = pow((subAE[i - 1] - '0'), (subAE[i + 1] - '0')) + '0';
            //shift everything
            for (int j = i + 2; j < end + 1; j++) {
                subAE[j - 2] = subAE[j];
            }
            end -= 2;
            if (end == 1) break;
            subAE[end - 1] = '#';
            subAE[end] = '#';
            i = end;
        }
    }
    for (int i = 0; i < end + 1; i++) {
        if (subAE[i] == '*') {
            subAE[i - 1] = (subAE[i - 1] - '0') * (subAE[i + 1] - '0') + '0';
            //shift everything
            for (int j = i + 3; j < end + 1; j++) {
                subAE[j - 2] = subAE[j];
            }
            subAE[end - 2] = '#';
            subAE[end - 1] = '#';
            end -= 2;

            i--;

        }
        else if (subAE[i] == '/') {
            subAE[i - 1] = (subAE[i - 1] - '0') / (subAE[i + 1] - '0') + '0';
            //shift everything
            for (int j = i + 2; j < end + 1; j++) {
                subAE[j - 2] = subAE[j];
                subAE[end - 2] = '#';
                subAE[end - 1] = '#';
                end -= 2;

                i--;
            }
        }
    }

    for (int i = 0; i < end; i++) {
        if (subAE[i] == '+') {
            subAE[i - 1] = subAE[i - 1] - '0' + subAE[i + 1];
            //shift everything
            for (int j = i + 2; j < end + 1; j++) {
                subAE[j - 2] = subAE[j];
            }
            subAE[end - 2] = '#';
            subAE[end - 1] = '#';
            end -= 2;

            i--;

        }
        else if (subAE[i] == '-') {
            subAE[i - 1] = subAE[i - 1] - subAE[i + 1] + '0';
            //shift everything
            for (int j = i + 2; j < end + 1; j++) {
                subAE[j - 2] = subAE[j];
            }
            subAE[end - 2] = '#';
            subAE[end - 1] = '#';
            end -= 2;

            i--;
        }
    }

    return subAE[0];
}

int pow(int num1, int num2) {
    int result = 1;
    for (int i = 0; i < num2; i++) {
        result *= num1;
    }

    return result;
}
