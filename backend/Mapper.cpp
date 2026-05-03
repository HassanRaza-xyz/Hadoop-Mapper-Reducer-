#include <iostream>
#include <string>
#include <sstream>

using namespace std;

int main() {
    string line;
    // Ye loop tab tak chalega jab tak file mein data hai
    while (getline(cin, line)) {
        // Agar line khali hai to skip karo
        if (line.empty()) continue;

        stringstream ss(line);
        string word;
        while (ss >> word) {
            // Output format: word <tab> 1
            cout << word << "\t1" << endl; 
        }
    }
    return 0;
}