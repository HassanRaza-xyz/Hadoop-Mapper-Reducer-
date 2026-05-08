#include <iostream>
#include <string>
#include <sstream>

using namespace std;

int main() {
    try {
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
    } catch (const exception& ex) {
        // Error messages stderr par jaayenge taa-ke mapper output safe rahe
        cerr << "Mapper error: " << ex.what() << endl;
        return 1;
    } catch (...) {
        cerr << "Mapper error: unknown exception" << endl;
        return 1;
    }

    return 0;
}