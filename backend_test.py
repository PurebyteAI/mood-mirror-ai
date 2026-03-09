import requests
import sys
import json
from datetime import datetime

class MoodMirrorAPITester:
    def __init__(self, base_url="https://web-constructor-68.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if endpoint else self.base_url
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=timeout)

            print(f"Response Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if response.headers.get('content-type', '').startswith('application/json'):
                    response_data = response.json()
                    print(f"Response preview: {json.dumps(response_data, indent=2)[:300]}...")
                    return success, response_data
                else:
                    print(f"Response: {response.text[:200]}...")
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text[:500]}")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timed out after {timeout} seconds")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test(
            "Root API Endpoint",
            "GET", 
            "",
            200
        )

    def test_text_analysis(self):
        """Test text mood analysis"""
        test_data = {
            "input_type": "text",
            "content": "I'm feeling really happy today! The sun is shining and everything seems perfect."
        }
        return self.run_test(
            "Text Mood Analysis",
            "POST",
            "analyze",
            200,
            data=test_data,
            timeout=10  # AI call may take longer
        )

    def test_drawing_analysis(self):
        """Test drawing mood analysis with base64 image"""
        # Create a simple base64 encoded image data URL for testing vision analysis
        test_data = {
            "input_type": "drawing", 
            "content": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        }
        return self.run_test(
            "Drawing Mood Analysis (Vision)",
            "POST",
            "analyze", 
            200,
            data=test_data,
            timeout=15  # Vision analysis may take longer
        )

    def test_speech_analysis(self):
        """Test speech mood analysis"""
        test_data = {
            "input_type": "speech",
            "content": "I've been feeling a bit stressed lately with work but I'm trying to stay positive and calm"
        }
        return self.run_test(
            "Speech Mood Analysis",
            "POST",
            "analyze",
            200,
            data=test_data,
            timeout=10
        )

    def test_get_history(self):
        """Test getting mood analysis history"""
        return self.run_test(
            "Get Mood History",
            "GET",
            "history",
            200
        )

    def test_invalid_analysis(self):
        """Test invalid analysis request"""
        test_data = {
            "input_type": "invalid",
            "content": ""
        }
        return self.run_test(
            "Invalid Analysis Request",
            "POST",
            "analyze",
            422,  # Validation error
            data=test_data
        )

    def test_save_to_journal(self, analysis_id):
        """Test saving analysis to journal"""
        test_data = {
            "analysis_id": analysis_id,
            "note": "This is a test journal note for my mood reflection."
        }
        return self.run_test(
            "Save Analysis to Journal",
            "POST",
            "journal/save",
            200,
            data=test_data
        )

    def test_get_journal(self):
        """Test getting journal entries"""
        return self.run_test(
            "Get Journal Entries",
            "GET",
            "journal?days=30",
            200
        )

    def test_get_journal_trends(self):
        """Test getting journal trends"""
        return self.run_test(
            "Get Journal Trends",
            "GET", 
            "journal/trends?days=30",
            200
        )

    def test_delete_journal_entry(self, entry_id):
        """Test deleting a journal entry"""
        return self.run_test(
            "Delete Journal Entry",
            "DELETE",
            f"journal/{entry_id}",
            200
        )

    def test_save_nonexistent_analysis(self):
        """Test saving nonexistent analysis to journal"""
        test_data = {
            "analysis_id": "nonexistent-id-12345",
            "note": "This should fail"
        }
        return self.run_test(
            "Save Nonexistent Analysis",
            "POST",
            "journal/save",
            404,
            data=test_data
        )

    def test_delete_nonexistent_journal_entry(self):
        """Test deleting nonexistent journal entry"""
        return self.run_test(
            "Delete Nonexistent Entry",
            "DELETE",
            "journal/nonexistent-id-12345",
            404
        )

    def validate_analysis_response(self, response_data):
        """Validate the structure of analysis response"""
        required_fields = ["id", "input_type", "emotions", "dominant_mood", "response_text", "response_type", "timestamp"]
        
        print("\n🔍 Validating analysis response structure...")
        for field in required_fields:
            if field not in response_data:
                print(f"❌ Missing required field: {field}")
                return False
            else:
                print(f"✅ Field '{field}' present")

        # Validate emotions structure
        if "emotions" in response_data and isinstance(response_data["emotions"], list):
            for emotion in response_data["emotions"]:
                if not isinstance(emotion, dict) or "emotion" not in emotion or "score" not in emotion:
                    print(f"❌ Invalid emotion structure: {emotion}")
                    return False
                if not 0 <= emotion["score"] <= 1:
                    print(f"❌ Invalid emotion score: {emotion['score']}")
                    return False
            print(f"✅ Emotions structure valid ({len(response_data['emotions'])} emotions)")

        return True

def main():
    # Setup
    tester = MoodMirrorAPITester()
    
    print("=" * 60)
    print("🎭 AI MOOD MIRROR API TESTING")
    print("=" * 60)

    # Run basic tests
    success, root_response = tester.test_root_endpoint()
    if not success:
        print("\n❌ Root endpoint failed, stopping tests")
        return 1

    # Test mood analysis endpoints and store IDs for journal tests
    print("\n📝 Testing Text Analysis...")
    success, text_response = tester.test_text_analysis()
    analysis_ids = []
    if success and text_response:
        tester.validate_analysis_response(text_response)
        analysis_ids.append(text_response.get('id'))

    print("\n🎨 Testing Drawing Analysis...")  
    success, draw_response = tester.test_drawing_analysis()
    if success and draw_response:
        tester.validate_analysis_response(draw_response)
        analysis_ids.append(draw_response.get('id'))

    print("\n🎤 Testing Speech Analysis...")
    success, speech_response = tester.test_speech_analysis()
    if success and speech_response:
        tester.validate_analysis_response(speech_response)
        analysis_ids.append(speech_response.get('id'))

    # Test history endpoints
    print("\n📚 Testing History...")
    success, history_response = tester.test_get_history()

    # Test journal endpoints
    print("\n📖 Testing Journal Features...")
    
    # Test saving to journal
    if analysis_ids:
        success, save_response = tester.test_save_to_journal(analysis_ids[0])
    
    # Test getting journal entries
    success, journal_response = tester.test_get_journal()
    
    # Test getting journal trends 
    success, trends_response = tester.test_get_journal_trends()
    
    # Test deleting journal entry (if we have entries)
    if journal_response and isinstance(journal_response, list) and len(journal_response) > 0:
        entry_to_delete = journal_response[0].get('id')
        if entry_to_delete:
            success, delete_response = tester.test_delete_journal_entry(entry_to_delete)

    # Test error handling
    print("\n🚫 Testing Error Handling...")
    tester.test_invalid_analysis()
    tester.test_save_nonexistent_analysis()
    tester.test_delete_nonexistent_journal_entry()

    # Print results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed")
    print("=" * 60)
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())