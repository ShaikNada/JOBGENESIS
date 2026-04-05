# Start ML Engine (JobGenesis)
cd ml-engine
if (Test-Path "venv") {
    .\venv\Scripts\Activate.ps1
}
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python main.py
