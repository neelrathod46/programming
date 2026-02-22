#include <iostream>
#include <bitset>
#include <string>

using namespace std;

bitset<20> booths_multiply(int m, int q) {
    bitset<21> reg; 
    
    for (int i = 0; i < 10; i++) {
        if ((q >> i) & 1) reg.set(i + 1);
    }

    cout << "Start: " << reg.to_string() << "\n\n";

    for (int i = 0; i < 10; i++) {
        int q0 = reg[1];        
        int q_minus_1 = reg[0]; 
        
        int upper = 0;
        for (int j = 0; j < 10; j++) if (reg[j + 11]) upper |= (1 << j);
        if (upper & (1 << 9)) upper |= ~((1 << 10) - 1); 

        if (q0 == 1 && q_minus_1 == 0) {
            cout << "Sub:   ";
            upper -= m;
        } 
        else if (q0 == 0 && q_minus_1 == 1) {
            cout << "Add:   ";
            upper += m;
        } else {
            cout << "No Op: ";
        }

        for (int j = 0; j < 10; j++) reg[j + 11] = (upper >> j) & 1;

        bool sign_bit = reg[20];
        reg >>= 1;
        reg[20] = sign_bit;

        string s = reg.to_string();
        cout << s.substr(0, 10) << " " << s.substr(10, 10) << " " << s.substr(20, 1) << endl;
    }

    bitset<20> result;
    for (int i = 0; i < 20; i++) result[i] = reg[i + 1];
    
    return result;
}

int main() {
    int m = 4, q = -6;
    cout << "Multiplying " << m << " * " << q << endl;
    cout << "Format: Action | Accumulator | Multiplier | Q-1" << endl;
    
    bitset<20> res = booths_multiply(m, q);
    
    cout << "\nFinal Binary: " << res << endl;
    return 0;
}
