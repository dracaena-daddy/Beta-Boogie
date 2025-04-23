# cnn_lstm_service/model.py
import torch.nn as nn

class CNNLSTMVolatilityModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv1d(1, 16, kernel_size=3, padding=1)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.2)
        self.lstm = nn.LSTM(input_size=16, hidden_size=50, batch_first=True)
        self.fc = nn.Linear(50, 1)

    def forward(self, x):
        x = x.permute(0, 2, 1)            # (batch, features, seq)
        x = self.relu(self.conv1(x))
        x = self.dropout(x)
        x = x.permute(0, 2, 1)            # (batch, seq, features)
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :]).squeeze()
