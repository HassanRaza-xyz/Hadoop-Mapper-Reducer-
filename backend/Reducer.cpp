#include <iostream>
#include <string>

using namespace std;

int main() {
    string line, current_word = "";
    int current_count = 0;

    // Mapper se sorted data ayega yahan
    while (getline(cin, line)) {
        size_t tab_pos = line.find('\t');
        if (tab_pos == string::npos) continue;

        string word = line.substr(0, tab_pos);
        int count = stoi(line.substr(tab_pos + 1));

        if (word == current_word) {
            current_count += count;
        } else {
            if (!current_word.empty()) {
                cout << current_word << "\t" << current_count << endl;
            }
            current_word = word;
            current_count = count;
        }
    }
    // Last word ka output
    if (!current_word.empty()) {
        cout << current_word << "\t" << current_count << endl;
    }
    return 0;
}