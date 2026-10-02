#!/usr/bin/env python3
"""
Shapla Chattar Live: Voice Generation using Gemini 3.8 Flash TTS
Model: gemini-3.8-flash-tts (or gemini-3.8-flash-lite-tts)

This script synthesizes hyper-realistic Dhaka street voices using Google Gemini 3.8
Flash Text-to-Speech via the `google-genai` SDK.

Features:
- Structured speech_metadata delivery controls (audio profile, scene acoustics, director notes, tone, pace, accent).
- Verbatim Bengali transcripts enriched with Gemini 3.8 inline vocal tags:
  <short pause>, <long pause>, <sigh>, <laugh>, <chuckle>, <gasp>, |uh-huh|, |mm-hmm|.
- Support for 30 prebuilt studio voices (Puck, Fenrir, Aoede, Enceladus, Kore, Charon, etc.)
  or custom Voice Design personas created via `client.voices.create(type="prompted")`.
- Generates clean 24kHz mono WAV files into voices/ and builds voices/voices.js.
- Generates optional base64 embedded voices.js for direct zero-CORS file:// opening in browsers.
- Supports single line generation (--line <id>), multiple takes (--takes <n>), and --dry-run.

Usage:
  # Dry run to inspect all 61 lines, styles, and character voices:
  python3 generate_voices.py --dry-run

  # Generate all voices using prebuilt voices:
  export GEMINI_API_KEY="your-api-key"
  python3 generate_voices.py

  # Generate a single clip with 2 takes:
  python3 generate_voices.py --line hawker_tea_1 --takes 2

  # Generate with custom designed voices using client.voices:
  python3 generate_voices.py --voice-mode custom

  # Embed audio as base64 in voices/voices.js (works with file:/// without a local server):
  python3 generate_voices.py --embed-base64
"""

import os
import sys
import json
import time
import base64
import wave
import argparse
from pathlib import Path

# Character Voice Profiles
VOICE_PROFILES = {
    "V_MURI": {
        "name": "Kashem (Jhalmuri Vendor)",
        "design_prompt": (
            "A raspy, weathered 55-year-old male street vendor from Old Dhaka, Bangladesh. "
            "Slightly nasal, gravelly, high vocal projection, speaking colloquial Dhaka Bengali "
            "with a rhythmic, melodic hawker cadence."
        ),
        "prebuilt": "Charon",  # Deep, textured male voice
    },
    "V_CHA": {
        "name": "Rahim Mama (Tea Stall Owner)",
        "design_prompt": (
            "A warm, husky 38-year-old Bangladeshi male tea stall owner in Motijheel, Dhaka. "
            "Fast, familiar, teasing urban Dhaka accent, friendly and welcoming tone."
        ),
        "prebuilt": "Fenrir",  # Resonant, warm male voice
    },
    "V_FUCHKA": {
        "name": "Fuchka & Chotpoti Seller",
        "design_prompt": (
            "A 32-year-old Bangladeshi male street food vendor. Clear, rhythmic, upbeat, "
            "calling out fast street food rhymes with authentic Dhaka street inflection."
        ),
        "prebuilt": "Puck",  # Playful, upbeat male voice
    },
    "V_DAB": {
        "name": "Green Coconut Vendor",
        "design_prompt": (
            "A sturdy 40-year-old rustic Bangladeshi male coconut seller. Loud, punchy, "
            "outdoor projecting voice, earthy and confident."
        ),
        "prebuilt": "Alnilam",  # Sturdy, grounded male voice
    },
    "V_BADAM": {
        "name": "Peanut Vendor",
        "design_prompt": (
            "A roving 48-year-old Bangladeshi male peanut vendor. Singing, melodic street "
            "call with stretched vowels and a bouncy, walking cadence."
        ),
        "prebuilt": "Zephyr",  # Mellow, melodic male voice
    },
    "V_PAPER": {
        "name": "Newspaper Hawker",
        "design_prompt": (
            "An energetic 30-year-old Bangladeshi male morning newspaper seller in Motijheel. "
            "Fast-paced, high morning alertness, calling out headlines with rapid cadence."
        ),
        "prebuilt": "Puck",  # Bright, quick male voice
    },
    "V_COVER": {
        "name": "Mobile Accessories Seller",
        "design_prompt": (
            "A confident 28-year-old Bangladeshi male electronics gadget promoter on the sidewalk. "
            "Slick, fast, persuasive commercial street pitch."
        ),
        "prebuilt": "Puck",
    },
    "V_BOOK": {
        "name": "Second-hand Book Seller",
        "design_prompt": (
            "A gentle, persuasive 42-year-old Bangladeshi male book vendor. Polite, conversational, "
            "respectful tone addressed to commuters."
        ),
        "prebuilt": "Iapetus",
    },
    "V_SHOE": {
        "name": "Shoe Polisher",
        "design_prompt": (
            "A 46-year-old Bangladeshi male shoe shiner squatting on the pavement. Low, steady, "
            "rhythmic street call repeated over busy foot traffic."
        ),
        "prebuilt": "Charon",
    },
    "V_WATER": {
        "name": "Water Boy",
        "design_prompt": (
            "A 14-year-old young Bangladeshi adolescent boy darting between buses at Shapla Chattar. "
            "Bright, youthful, slightly cracking energetic voice shouting above diesel engines."
        ),
        "prebuilt": "Puck",  # Youthful, nimble tone
    },
    "V_HELPER": {
        "name": "Rubel (Bus Helper & Conductor)",
        "design_prompt": (
            "A 19-year-old Bangladeshi male bus helper hanging from the door at a crowded Dhaka roundabout. "
            "Very hoarse, cracked, gritty voice from shouting all day over roaring engines and pressure horns. "
            "Rapid-fire staccato machine-gun delivery with authentic Dhaka transport slang."
        ),
        "prebuilt": "Fenrir",  # Gritty, intense male voice
    },
    "V_PULLER": {
        "name": "Babul (Rickshaw Puller from Rangpur)",
        "design_prompt": (
            "A tired, hardworking 45-year-old Bangladeshi male rickshaw puller originally from Rangpur. "
            "Dry, low, breathy voice with a subtle northern regional lilt. Economical with words, "
            "weary but pragmatic."
        ),
        "prebuilt": "Enceladus",  # Breathy, weathered male voice
    },
    "V_SALMA": {
        "name": "Salma (Bank Officer & Passenger)",
        "design_prompt": (
            "A clear, articulate 32-year-old Bangladeshi woman working in Motijheel commercial area. "
            "Educated urban Dhaka accent, brisk, polite, but firm and confident when bargaining."
        ),
        "prebuilt": "Kore",  # Clear, professional female voice
    },
    "V_POLICE": {
        "name": "Traffic Police Sergeant",
        "design_prompt": (
            "An authoritative 42-year-old Bangladeshi male traffic police sergeant at Shapla Chattar. "
            "Sharp, clipped commanding bark that cuts through roaring traffic, horns, and whistle blasts."
        ),
        "prebuilt": "Fenrir",  # Strong, commanding male voice
    },
    "V_CONSTABLE": {
        "name": "Traffic Constable",
        "design_prompt": (
            "A 30-year-old Bangladeshi male traffic constable on the asphalt. Harsh, rough, "
            "impatient outdoor shout waving stick at rickshaws."
        ),
        "prebuilt": "Charon",
    },
    "V_OFFICE": {
        "name": "Office Executive",
        "design_prompt": (
            "A 34-year-old Bangladeshi male corporate employee in Motijheel. Urban Dhaka accent, "
            "hurried, slightly breathless on the phone or casual during lunch."
        ),
        "prebuilt": "Aoede",  # Expressive, articulate voice
    },
    "V_PEON": {
        "name": "Senior Office Peon",
        "design_prompt": (
            "A 56-year-old Bangladeshi male office peon carrying paper files. Soft, deferential, "
            "polite, slightly winded after climbing office stairs."
        ),
        "prebuilt": "Enceladus",  # Soft, mature male voice
    },
    "V_AUNTY": {
        "name": "Woman in Bank Queue",
        "design_prompt": (
            "A firm, no-nonsense 45-year-old Bangladeshi woman in an ATM queue. Sharp, "
            "irritated, public rebuke voice with crisp urban Dhaka inflection."
        ),
        "prebuilt": "Kore",
    },
    "V_GUARD": {
        "name": "Security Guard",
        "design_prompt": (
            "A gravelly 62-year-old Bangladeshi male building security guard. Stern, dry, "
            "officious, tired from sitting on a stool all day."
        ),
        "prebuilt": "Charon",  # Gravelly, mature voice
    },
    "V_TEA_A": {
        "name": "Cricket Fan at Tea Stall",
        "design_prompt": (
            "An enthusiastic 50-year-old Bangladeshi male having tea-stall adda. "
            "Lively, chuckling, animated, passionate about cricket."
        ),
        "prebuilt": "Aoede",
    },
    "V_TEA_B": {
        "name": "Cynic at Tea Stall",
        "design_prompt": (
            "A late 50s experienced Bangladeshi male chatting over tea. Deep, weary, "
            "humorous, sighing at inflation and politics."
        ),
        "prebuilt": "Enceladus",
    },
    "V_PASSER": {
        "name": "Passer-by in Rain",
        "design_prompt": (
            "A startled, energetic adult Bangladeshi caught in sudden heavy monsoon rain. "
            "Laughing with surprise, shouting over thunder and pouring rain."
        ),
        "prebuilt": "Puck",
    },
    "V_FRUIT": {
        "name": "Fruit Stall Vendor",
        "design_prompt": (
            "A 36-year-old Bangladeshi male fruit vendor on Motijheel footpath. Booming, "
            "rhythmic street cry drawn out on fruit names."
        ),
        "prebuilt": "Orus",
    },
    "V_CLOTH": {
        "name": "Footpath Clothes Vendor",
        "design_prompt": (
            "A 35-year-old Bangladeshi male footpath clothes seller. Loud, rhythmic, aggressive "
            "street chant with a clapping cadence, projecting across the street."
        ),
        "prebuilt": "Fenrir",
    },
    "V_SINGARA": {
        "name": "Singara Fryer",
        "design_prompt": (
            "A 40-year-old Bangladeshi male snack fryer. Warm, inviting street call shouted "
            "over the sizzle of hot oil."
        ),
        "prebuilt": "Algenib",
    },
    "V_AKH": {
        "name": "Sugarcane Juice Vendor",
        "design_prompt": (
            "A 38-year-old Bangladeshi male sugarcane juice seller. Clear, inviting call "
            "over a mechanical grinding press."
        ),
        "prebuilt": "Puck",
    },
    "V_PEYARA": {
        "name": "Spiced Guava Vendor",
        "design_prompt": (
            "A 34-year-old Bangladeshi male street snack vendor. Tempting, mouth-watering, "
            "alluring street cadence."
        ),
        "prebuilt": "Aoede",
    },
    "V_SIM": {
        "name": "SIM Card Promoter",
        "design_prompt": (
            "A 24-year-old young Bangladeshi male telecom promoter with a megaphone/booth. "
            "Rapid, slick, high-energy sales patter."
        ),
        "prebuilt": "Puck",
    },
    "V_ATTAR": {
        "name": "Attar & Prayer Items Vendor",
        "design_prompt": (
            "A 45-year-old gentle Bangladeshi male religious items seller outside mosque. "
            "Soft, pious, respectful, welcoming street voice."
        ),
        "prebuilt": "Rasalgethi",
    },
    "V_HOTEL": {
        "name": "Roadside Hotel Boy",
        "design_prompt": (
            "A 20-year-old young Bangladeshi male waiter standing outside a Bengali eatery. "
            "Rapid-fire, loud restaurant barking reciting lunch menu items."
        ),
        "prebuilt": "Puck",
    },
    "V_COOLIE": {
        "name": "Railway Coolie (Porter)",
        "design_prompt": (
            "A 48-year-old husky, sturdy Bangladeshi railway porter at Kamalapur station. "
            "Weathered, deep, breathless from carrying heavy luggage, hurried solicitation."
        ),
        "prebuilt": "Charon",
    },
    "V_SNATCH_VIC": {
        "name": "Snatching Victim",
        "design_prompt": (
            "A 28-year-old Bangladeshi male commuter who just had his phone snatched. "
            "Panicked, high-pitched, desperate public scream for help."
        ),
        "prebuilt": "Fenrir",
    },
    "V_CHASER": {
        "name": "Passer-by Chasing Thief",
        "design_prompt": (
            "A 26-year-old athletic Bangladeshi male passer-by sprinting after a snatcher. "
            "Aggressive, furious, breathless shout at full run."
        ),
        "prebuilt": "Fenrir",
    },
    "V_GIVEUP": {
        "name": "Cynical Bystander",
        "design_prompt": (
            "A 48-year-old cynical Bangladeshi bystander catching breath after a chase. "
            "Deep, resigned sigh, realistic Dhaka resignation."
        ),
        "prebuilt": "Enceladus",
    },
    "V_GUARDIAN": {
        "name": "Mother at School Gate",
        "design_prompt": (
            "A caring 38-year-old Bangladeshi mother waiting outside school gate in Dhaka. "
            "Affectionate, slightly scolding, protective female voice."
        ),
        "prebuilt": "Kore",
    },
    "V_PUPIL": {
        "name": "School Child",
        "design_prompt": (
            "A 10-year-old young Bangladeshi school child in uniform. Whining, playful, "
            "pleading kid's voice begging for ice cream."
        ),
        "prebuilt": "Puck",
    },
    "V_FOOTBALL": {
        "name": "Youth Playing Football",
        "design_prompt": (
            "A 16-year-old Bangladeshi teenage boy playing football on the Mohammedan club ground. "
            "Breathless, ecstatic, energetic outdoor shouting."
        ),
        "prebuilt": "Puck",
    },
    "V_PHONE": {
        "name": "Young Working Woman on Phone",
        "design_prompt": (
            "A tender 24-year-old Bangladeshi working woman speaking to her mother back in the village. "
            "Warm, affectionate, raising voice slightly over background street noise."
        ),
        "prebuilt": "Kore",
    },
}

# 56 Lines with Gemini 3.8 Flash TTS formatting:
# - 'tts_text': verbatim transcript containing inline vocal tags (<short pause>, <sigh>, <laugh>, etc.)
# - 'display_bn': clean visual Bengali text for speech bubbles (no XML tags)
# - 'en': English translation
# - 'style': detailed speech_metadata style prompt
LINES = [
    {
        "id": "hawker_jhalmuri_1",
        "voice": "V_MURI",
        "display_bn": "এই ঝালমুউউড়ি! স্পেশাল ঝালমুড়ি! দশ টাকা, বিশ টাকা! গরম ঝালমুড়ি নেন!",
        "tts_text": "এই ঝালমুউউড়ি! স্পেশাল ঝালমুড়ি! <short pause> দশ টাকা, বিশ টাকা! গরম ঝালমুড়ি নেন!",
        "en": "Jhalmuri! Special jhalmuri! Ten taka, twenty taka! Get fresh jhalmuri!",
        "style": (
            "AUDIO PROFILE: Kashem, 55, veteran Old Dhaka street hawker. "
            "THE SCENE: Packed footpath near Shapla Chattar, shouting over bus horns and traffic rumble. "
            "DIRECTOR'S NOTES: Rhythmic street sing-song. Stretch 'jhalmuuuri' high, then drop pitch on the prices. "
            "Vocal smile, lively street cadence in colloquial Old Dhaka Bangla."
        ),
    },
    {
        "id": "hawker_jhalmuri_2",
        "voice": "V_MURI",
        "display_bn": "মামা, মরিচ কি বেশি দিমু না কম? খাঁটি সরিষার তেল দিমু তো?",
        "tts_text": "মামা, মরিচ কি বেশি দিমু না কম? <short pause> খাঁটি সরিষার তেল দিমু তো?",
        "en": "Mama, more chilli or light? Pure mustard oil too, right?",
        "style": (
            "AUDIO PROFILE: Kashem, 55, friendly vendor. "
            "THE SCENE: Close-up at the jhalmuri cart, stirring spices with a spoon. "
            "DIRECTOR'S NOTES: Conversational, warm, slightly teasing. Direct query to a standing customer."
        ),
    },
    {
        "id": "hawker_tea_1",
        "voice": "V_CHA",
        "display_bn": "চা-আ-আ! গরম চা! আদা চা, দুধ চা, রঙ চা! মামা চা লাগবো?",
        "tts_text": "চা-আ-আ! গরম চা! <short pause> আদা চা, দুধ চা, রঙ চা! মামা চা লাগবো?",
        "en": "Tea! Piping hot tea! Ginger tea, milk tea, black tea! Need tea, mama?",
        "style": (
            "AUDIO PROFILE: Rahim Mama, 38, tea stall owner. Warm, raspy, welcoming Dhaka street voice. "
            "THE SCENE: Busy pavement tea shack, steam rising from kettles, clinking glasses. "
            "DIRECTOR'S NOTES: Quick, punchy, melodic shout projecting across the sidewalk to rushing commuters."
        ),
    },
    {
        "id": "hawker_tea_2",
        "voice": "V_CHA",
        "display_bn": "মামা, চিনি কি কড়া হইবো না কম? দুধ চা বানাই?",
        "tts_text": "মামা, চিনি কি কড়া হইবো না কম? <short pause> দুধ চা বানাই?",
        "en": "Mama, strong sugar or light? Shall I make milk tea?",
        "style": (
            "AUDIO PROFILE: Rahim Mama, 38. "
            "THE SCENE: Pouring condensed milk from a can into a glass. "
            "DIRECTOR'S NOTES: Fast, friendly, colloquial Motijheel Dhaka lilt."
        ),
    },
    {
        "id": "hawker_fuchka_1",
        "voice": "V_FUCHKA",
        "display_bn": "ফুচকা! চটপটি! তেঁতুলের টক-ঝাল-মিষ্টি! একদম স্পেশাল চটপটি!",
        "tts_text": "ফুচকা! চটপটি! <short pause> তেঁতুলের টক-ঝাল-মিষ্টি! একদম স্পেশাল চটপটি!",
        "en": "Fuchka! Chotpoti! Tamarind sour, spicy and sweet! Special chotpoti!",
        "style": (
            "AUDIO PROFILE: Fuchka vendor, early 30s. "
            "THE SCENE: Busy street cart surrounded by office-goers. "
            "DIRECTOR'S NOTES: Three rhythmic beats on 'tok-jhal-mishti', mouth-watering and appetizing delivery."
        ),
    },
    {
        "id": "hawker_dab_1",
        "voice": "V_DAB",
        "display_bn": "মিষ্টি ডাব! কচি ডাব! বরফ ঠান্ডা ডাবের পানি! মামা কচি দেইখা কাইটা দিমু?",
        "tts_text": "মিষ্টি ডাব! কচি ডাব! <short pause> বরফ ঠান্ডা ডাবের পানি! মামা কচি দেইখা কাইটা দিমু?",
        "en": "Sweet green coconut! Tender coconut! Ice-cold water! Shall I cut a fresh one for you, mama?",
        "style": (
            "AUDIO PROFILE: Coconut vendor, 40. Rustic, sturdy outdoor voice. "
            "THE SCENE: Chopping green coconuts with a dao machete on the sidewalk. "
            "DIRECTOR'S NOTES: Confident, hearty, projecting shout over midday street heat."
        ),
    },
    {
        "id": "hawker_badam_1",
        "voice": "V_BADAM",
        "display_bn": "এই বাদাম! গরম বাদাম! লাল বাদাম, মুচমুচে টাটকা বাদাম!",
        "tts_text": "এই বাদাম! গরম বাদাম! <short pause> লাল বাদাম, মুচমুচে টাটকা বাদাম!",
        "en": "Peanuts! Hot peanuts! Red peanuts, crunchy fresh peanuts!",
        "style": (
            "AUDIO PROFILE: Peanut seller, late 40s. "
            "THE SCENE: Walking briskly along the curb carrying a tin tray of roasted nuts. "
            "DIRECTOR'S NOTES: Stretched vowels on 'baadaam', bouncy, walking cadence."
        ),
    },
    {
        "id": "hawker_paper_1",
        "voice": "V_PAPER",
        "display_bn": "আজকের পত্রিকা! তাজা খবর! দৈনিক পত্রিকা নেন ভাই, খেলার খবর আছে!",
        "tts_text": "আজকের পত্রিকা! তাজা খবর! <short pause> দৈনিক পত্রিকা নেন ভাই, খেলার খবর আছে!",
        "en": "Today's paper! Fresh news! Daily newspaper, bhai, all the sports news!",
        "style": (
            "AUDIO PROFILE: Newspaper seller, 30. "
            "THE SCENE: 8:30 AM morning rush outside commercial bank towers. "
            "DIRECTOR'S NOTES: Fast-paced, high energy, urgent and crisp."
        ),
    },
    {
        "id": "hawker_cover_1",
        "voice": "V_COVER",
        "display_bn": "মোবাইল কভার! যেকোনো মডেল, এক দাম একশো টাকা! গ্লাস প্রটেক্টর লাগাইয়া নেন!",
        "tts_text": "মোবাইল কভার! যেকোনো মডেল, এক দাম একশো টাকা! গ্লাস প্রটেক্টর লাগাইয়া নেন!",
        "en": "Mobile covers! Any model, one price a hundred taka! Get a glass protector fitted!",
        "style": (
            "AUDIO PROFILE: Electronics vendor, late 20s. "
            "THE SCENE: Standing by an umbrella stand hung with phone covers. "
            "DIRECTOR'S NOTES: Slick, upbeat, confident sales patter."
        ),
    },
    {
        "id": "hawker_book_1",
        "voice": "V_BOOK",
        "display_bn": "বই নেন আপা! গল্প, উপন্যাস, একদম অর্ধেক দামে! দেইখা লন আপা!",
        "tts_text": "বই নেন আপা! গল্প, উপন্যাস, একদম অর্ধেক দামে! দেইখা লন আপা!",
        "en": "Take a book, apa! Stories, novels, right at half price! Have a look, apa!",
        "style": (
            "AUDIO PROFILE: Second-hand book vendor, 42. "
            "THE SCENE: Sidewalk book spread on plastic sheets. "
            "DIRECTOR'S NOTES: Polite, gentle, persuasive call directed at a passing woman."
        ),
    },
    {
        "id": "hawker_shoe_1",
        "voice": "V_SHOE",
        "display_bn": "জুতা পালিশ! জুতা কালার! আয়না বানায়া দিমু স্যার, বসেন!",
        "tts_text": "জুতা পালিশ! জুতা কালার! <short pause> আয়না বানায়া দিমু স্যার, বসেন!",
        "en": "Shoe polish! Shoe recolour! I'll shine it like a mirror, sir, take a seat!",
        "style": (
            "AUDIO PROFILE: Shoe shiner, 46. "
            "THE SCENE: Squatting by a wooden polish kit on the footpath curb. "
            "DIRECTOR'S NOTES: Low, repetitive, rhythmic call over pedestrian footfalls."
        ),
    },
    {
        "id": "kid_water_1",
        "voice": "V_WATER",
        "display_bn": "পানি! ঠান্ডা মাম পানি! মামা ঠান্ডা পানি নেন, বরফ ঠান্ডা দশ টাকা!",
        "tts_text": "পানি! ঠান্ডা মাম পানি! <short pause> মামা ঠান্ডা পানি নেন, বরফ ঠান্ডা দশ টাকা!",
        "en": "Water! Cold bottled water! Mama take cold water, ice cold ten taka!",
        "style": (
            "AUDIO PROFILE: 14-year-old street kid dodging traffic with a bucket of ice water bottles. "
            "THE SCENE: Running between idling buses in gridlock. "
            "DIRECTOR'S NOTES: Bright, high, breathless, nimble, projecting above rumbling bus exhausts."
        ),
    },
    {
        "id": "helper_gulistan_1",
        "voice": "V_HELPER",
        "display_bn": "গুলিস্তান! গুলিস্তান! গুলিইইস্তান! খালি গাড়ি, সিট খালি! উঠেন উঠেন!",
        "tts_text": "গুলিস্তান! গুলিস্তান! গুলিইইস্তান! <short pause> খালি গাড়ি, সিট খালি! উঠেন উঠেন!",
        "en": "Gulistan! Gulistan! Empty bus, seats empty! Get on, get on!",
        "style": (
            "AUDIO PROFILE: Rubel, 19, bus helper. Hoarse, cracked, gritty voice from shouting all day. "
            "THE SCENE: Hanging half out the bus door, slapping the metal side at Shapla Chattar. "
            "DIRECTOR'S NOTES: Machine-gun rapid-fire cadence, breathless, urgent street slang."
        ),
    },
    {
        "id": "helper_kamalapur_1",
        "voice": "V_HELPER",
        "display_bn": "কমলাপুর! সায়েদাবাদ! বিশ্বরোড! ডাইরেক্ট কমলাপুর, উঠেন ভাই জলদি!",
        "tts_text": "কমলাপুর! সায়েদাবাদ! বিশ্বরোড! <short pause> ডাইরেক্ট কমলাপুর, উঠেন ভাই জলদি!",
        "en": "Kamalapur! Sayedabad! Bishwa Road! Direct Kamalapur, get on quick bhai!",
        "style": (
            "AUDIO PROFILE: Bus helper, 19. "
            "THE SCENE: Bus slowing down briefly by the curb without fully stopping. "
            "DIRECTOR'S NOTES: Fast, urgent, waving passengers aboard on the roll."
        ),
    },
    {
        "id": "helper_aste_1",
        "voice": "V_HELPER",
        "display_bn": "ওস্তাদ আস্তে! লেডিস নামতাছে! আস্তে আস্তে!",
        "tts_text": "ওস্তাদ আস্তে! লেডিস নামতাছে! আস্তে আস্তে!",
        "en": "Ostad slow down! Ladies getting down! Slow down, slow!",
        "style": (
            "AUDIO PROFILE: Bus helper, 19. "
            "THE SCENE: Shouting through the bus door toward the driver in front. "
            "DIRECTOR'S NOTES: Sharp, piercing protective warning shout. Authentic bus crew lingo."
        ),
    },
    {
        "id": "helper_ostad_1",
        "voice": "V_HELPER",
        "display_bn": "ওস্তাদ বাঁয়ে চাপান! ডাইনে প্লাস্টিক! যান যান যান!",
        "tts_text": "ওস্তাদ বাঁয়ে চাপান! ডাইনে প্লাস্টিক! যান যান যান!",
        "en": "Ostad squeeze left! Clear on the right! Go go go!",
        "style": (
            "AUDIO PROFILE: Bus helper, 19. "
            "THE SCENE: Leaning out the door guiding the driver through tight roundabout traffic. "
            "DIRECTOR'S NOTES: Rapid, clipped commands. Authentic helper slang ('plastic' meaning fragile obstacle/clear space)."
        ),
    },
    {
        "id": "helper_namen_1",
        "voice": "V_HELPER",
        "display_bn": "মতিঝিল শাপলা চত্বর! নামেন নামেন, মতিঝিল নামেন!",
        "tts_text": "মতিঝিল শাপলা চত্বর! নামেন নামেন, মতিঝিল নামেন!",
        "en": "Motijheel Shapla Chattar! Get down, get down, Motijheel!",
        "style": (
            "AUDIO PROFILE: Bus helper, 19. "
            "THE SCENE: Arriving at the main Motijheel stop. "
            "DIRECTOR'S NOTES: Loud, clipped destination announcement, hurried and commanding."
        ),
    },
    {
        "id": "helper_vara_1",
        "voice": "V_HELPER",
        "display_bn": "ভাড়াটা বাড়ান ভাই! সামনের ভাই, ভাড়া দেন! ভাংতি দিয়েন!",
        "tts_text": "ভাড়াটা বাড়ান ভাই! সামনের ভাই, ভাড়া দেন! ভাংতি দিয়েন!",
        "en": "Pass the fare up front, bhai! Brother in front, fare please! Give small notes!",
        "style": (
            "AUDIO PROFILE: Bus helper, 19. "
            "THE SCENE: Squeezing down a packed commuter bus aisle. "
            "DIRECTOR'S NOTES: Impatient, raised voice, insistent commuter fare collection."
        ),
    },
    {
        "id": "rickshaw_ask_1",
        "voice": "V_SALMA",
        "display_bn": "মামা, কমলাপুর যাইবেন? যাবেন নাকি?",
        "tts_text": "মামা, কমলাপুর যাইবেন? যাবেন নাকি?",
        "en": "Mama, will you go to Kamalapur? Going?",
        "style": (
            "AUDIO PROFILE: Salma, 32, female bank officer. "
            "THE SCENE: Stepping out of a bank building onto the hot pavement. "
            "DIRECTOR'S NOTES: Crisp, brisk, educated urban Dhaka accent. In a hurry."
        ),
    },
    {
        "id": "rickshaw_price_1",
        "voice": "V_PULLER",
        "display_bn": "ষাট টাকা দিয়েন মামা।",
        "tts_text": "<sigh> ষাট টাকা দিয়েন মামা।",
        "en": "Give sixty taka, mama.",
        "style": (
            "AUDIO PROFILE: Babul, 45, rickshaw puller from Rangpur. "
            "THE SCENE: Sitting on his rickshaw seat wiping sweat. "
            "DIRECTOR'S NOTES: Low, dry, tired, slight northern lilt. Weary sigh first."
        ),
    },
    {
        "id": "rickshaw_bargain_1",
        "voice": "V_SALMA",
        "display_bn": "কী বলেন মামা! চল্লিশ টাকা দিমু, চলেন না!",
        "tts_text": "কী বলেন মামা! চল্লিশ টাকা দিমু, চলেন না!",
        "en": "What are you saying mama! I'll give forty, let's go!",
        "style": (
            "AUDIO PROFILE: Salma, 32. "
            "THE SCENE: Standing by the rickshaw wheel. "
            "DIRECTOR'S NOTES: Firm, confident, half-smiling Dhaka bargaining register."
        ),
    },
    {
        "id": "rickshaw_ok_1",
        "voice": "V_PULLER",
        "display_bn": "এই রোদে পোষায় না... আচ্ছা উঠেন, পঞ্চাশ দিয়েন।",
        "tts_text": "<sigh> এই রোদে পোষায় না... <short pause> আচ্ছা উঠেন, পঞ্চাশ দিয়েন।",
        "en": "Hardly pays in this heat... Alright get on, give fifty.",
        "style": (
            "AUDIO PROFILE: Babul, 45. "
            "THE SCENE: Reaching for the handlebars. "
            "DIRECTOR'S NOTES: Heavy resigned sigh, pragmatic compromise, tired but dignified."
        ),
    },
    {
        "id": "rickshaw_side_1",
        "voice": "V_PULLER",
        "display_bn": "সাইড! সাইড দেন মামা! এই রিকশা, সাইড!",
        "tts_text": "সাইড! সাইড দেন মামা! <short pause> এই রিকশা, সাইড!",
        "en": "Side! Give way mama! Hey rickshaw, side!",
        "style": (
            "AUDIO PROFILE: Babul, 45. "
            "THE SCENE: Pedaling hard through a swarm of pedestrians crossing the asphalt. "
            "DIRECTOR'S NOTES: Sharp, urgent warning shout over traffic, timing with bell rings."
        ),
    },
    {
        "id": "police_stop_1",
        "voice": "V_POLICE",
        "display_bn": "এই! থামেন! দাঁড়ান ওখানে! যাবেন না!",
        "tts_text": "এই! থামেন! দাঁড়ান ওখানে! যাবেন না!",
        "en": "Hey! Stop! Stop right there! Don't go!",
        "style": (
            "AUDIO PROFILE: Traffic sergeant, 42. "
            "THE SCENE: Center podium at Shapla Chattar holding up white-gloved hand. "
            "DIRECTOR'S NOTES: Authoritative, sharp commanding bark following a whistle blast."
        ),
    },
    {
        "id": "police_go_1",
        "voice": "V_POLICE",
        "display_bn": "যান, যান! টান দেন! তাড়াতাড়ি টানেন!",
        "tts_text": "যান, যান! টান দেন! তাড়াতাড়ি টানেন!",
        "en": "Go, go! Speed up! Clear out quickly!",
        "style": (
            "AUDIO PROFILE: Traffic sergeant, 42. "
            "THE SCENE: Waving held traffic forward across the intersection. "
            "DIRECTOR'S NOTES: Impatient, fast-moving, energetic traffic direction."
        ),
    },
    {
        "id": "office_late_1",
        "voice": "V_OFFICE",
        "display_bn": "ভাই, মিটিং কি শুরু হইয়া গেছে? আমি রাস্তায়, মতিঝিল জ্যামে আটকাইছি!",
        "tts_text": "ভাই, মিটিং কি শুরু হইয়া গেছে? <gasp> আমি রাস্তায়, মতিঝিল জ্যামে আটকাইছি!",
        "en": "Bhai, has the meeting started? I'm on the road, stuck in Motijheel jam!",
        "style": (
            "AUDIO PROFILE: Office worker, 34. "
            "THE SCENE: Walking fast on the sidewalk holding phone to ear amid roaring traffic. "
            "DIRECTOR'S NOTES: Slightly breathless, anxious, apologetic urban Dhaka tone."
        ),
    },
    {
        "id": "office_file_1",
        "voice": "V_PEON",
        "display_bn": "স্যার, বাংলাদেশ ব্যাংকের ফাইলটা সই করায়া আনছি। টেবিলে রাখলাম।",
        "tts_text": "স্যার, বাংলাদেশ ব্যাংকের ফাইলটা সই করায়া আনছি। টেবিলে রাখলাম।",
        "en": "Sir, I got the Bangladesh Bank file signed. Kept it on the desk.",
        "style": (
            "AUDIO PROFILE: Senior peon, 56. "
            "THE SCENE: Entering office cubicle holding bulky paper dossiers. "
            "DIRECTOR'S NOTES: Respectful, soft, deferential, slightly breathless."
        ),
    },
    {
        "id": "office_lunch_1",
        "voice": "V_OFFICE",
        "display_bn": "চলেন ভাই, দুপুর তো হইয়া গেল, মায়ের দোয়ায় যাইয়া খাইয়া আসি।",
        "tts_text": "চলেন ভাই, দুপুর তো হইয়া গেল, মায়ের দোয়ায় যাইয়া খাইয়া আসি।",
        "en": "Come on bhai, it's midday already, let's go eat at Mayer Doa.",
        "style": (
            "AUDIO PROFILE: Office worker, 34. "
            "THE SCENE: Walking out with colleagues at 1:15 PM lunch hour. "
            "DIRECTOR'S NOTES: Relaxed, friendly, warm corporate-friend camaraderie."
        ),
    },
    {
        "id": "bank_queue_1",
        "voice": "V_AUNTY",
        "display_bn": "এই ভাই, লাইনে দাঁড়ান! দেখতেছেন না মানুষ কতক্ষণ ধইরা দাঁড়ায় আছে!",
        "tts_text": "এই ভাই, লাইনে দাঁড়ান! দেখতেছেন না মানুষ কতক্ষণ ধইরা দাঁড়ায় আছে!",
        "en": "Hey bhai, stand in line! Can't you see people have been waiting so long!",
        "style": (
            "AUDIO PROFILE: Middle-aged woman in ATM line, 45. "
            "THE SCENE: Sunny queue outside a Sonali Bank ATM booth. "
            "DIRECTOR'S NOTES: Sharp, indignant, firm public rebuke, no-nonsense vocal projection."
        ),
    },
    {
        "id": "guard_1",
        "voice": "V_GUARD",
        "display_bn": "এইখানে বাইক রাখা একদম নিষেধ! ওইদিকে সরান!",
        "tts_text": "এইখানে বাইক রাখা একদম নিষেধ! ওইদিকে সরান!",
        "en": "Parking bikes here is strictly prohibited! Move it over there!",
        "style": (
            "AUDIO PROFILE: Security guard, 62. "
            "THE SCENE: Standing by building entrance with bamboo cane. "
            "DIRECTOR'S NOTES: Gravelly, dry, officious, weary but authoritative."
        ),
    },
    {
        "id": "tea_chat_1",
        "voice": "V_TEA_A",
        "display_bn": "কালকের খেলাটা দেখছিলেন মামা? শেষ ওভারে কী একটা ম্যাচ করলো!",
        "tts_text": "কালকের খেলাটা দেখছিলেন মামা? <laugh> শেষ ওভারে কী একটা ম্যাচ করলো!",
        "en": "Did you catch yesterday's game, mama? What a match in the final over!",
        "style": (
            "AUDIO PROFILE: Cricket enthusiast at tea stall, 50. "
            "THE SCENE: Evening adda around Rahim's tea stall. "
            "DIRECTOR'S NOTES: Animated, excited laugh, leaning in with tea cup in hand."
        ),
    },
    {
        "id": "tea_chat_2",
        "voice": "V_TEA_B",
        "display_bn": "আরে ভাই, টিম যা-ই করুক, বাংলাদেশ তো আমাদেরই! জিতবোই এবার!",
        "tts_text": "আরে ভাই, টিম যা-ই করুক, বাংলাদেশ তো আমাদেরই! জিতবোই এবার!",
        "en": "Whatever the team does bhai, Bangladesh is ours! We will win this time!",
        "style": (
            "AUDIO PROFILE: Optimistic tea stall regular, 50s. "
            "THE SCENE: Sipping hot black tea on wooden bench. "
            "DIRECTOR'S NOTES: Passionate, conversational Dhaka debate tone."
        ),
    },
    {
        "id": "tea_chat_3",
        "voice": "V_TEA_B",
        "display_bn": "বাজারে জিনিসপত্রের যে আগুন দাম ভাই, দিন চালানোই দায় হইয়া গেল!",
        "tts_text": "<sigh> বাজারে জিনিসপত্রের যে আগুন দাম ভাই, দিন চালানোই দায় হইয়া গেল!",
        "en": "With market prices catching fire bhai, it's getting impossible to get by!",
        "style": (
            "AUDIO PROFILE: Cynical elder, late 50s. "
            "THE SCENE: Shaking head over rising cost of living. "
            "DIRECTOR'S NOTES: Deep weary sigh, grim humor, relatable middle-class frustration."
        ),
    },
    {
        "id": "tea_chat_4",
        "voice": "V_TEA_A",
        "display_bn": "মামা, আরেক কাপ দেন তো, একটু কড়া কইরা দুধ চা বানাইয়েন!",
        "tts_text": "মামা, আরেক কাপ দেন তো, একটু কড়া কইরা দুধ চা বানাইয়েন!",
        "en": "Mama, one more cup please, make it a nice strong milk tea!",
        "style": (
            "AUDIO PROFILE: Regular tea drinker, 50. "
            "THE SCENE: Calling across the stall counter. "
            "DIRECTOR'S NOTES: Casual, relaxed, familiar Dhaka tone."
        ),
    },
    {
        "id": "rain_1",
        "voice": "V_PASSER",
        "display_bn": "আরে বৃষ্টি নামলো তো! দৌড়ান দৌড়ান, ছাউনিতে যান!",
        "tts_text": "<gasp> আরে বৃষ্টি নামলো তো! দৌড়ান দৌড়ান, ছাউনিতে যান! <laugh>",
        "en": "Oh rain has started! Run, run, get under the awning!",
        "style": (
            "AUDIO PROFILE: Adult pedestrian caught in sudden monsoon shower. "
            "THE SCENE: Sudden massive drops hitting asphalt, crowd scattering. "
            "DIRECTOR'S NOTES: Startled gasp followed by joyful, breathless laughter and running shout."
        ),
    },
    {
        "id": "rain_2",
        "voice": "V_PULLER",
        "display_bn": "মামা, পলিথিন টানায়া দিমু? ভিজা যাইবেন... বিশ টাকা বাড়ায়া দিয়েন।",
        "tts_text": "মামা, পলিথিন টানায়া দিমু? ভিজা যাইবেন... <short pause> বিশ টাকা বাড়ায়া দিয়েন।",
        "en": "Mama, should I pull up the plastic sheet? You'll get soaked... give twenty extra.",
        "style": (
            "AUDIO PROFILE: Babul, 45, rickshaw puller. "
            "THE SCENE: Unfurling black polythene sheet as heavy rain begins. "
            "DIRECTOR'S NOTES: Opportunistic, cheeky, bargaining over the sound of rain."
        ),
    },
    {
        "id": "hawker_fruit_1",
        "voice": "V_FRUIT",
        "display_bn": "আপেল, মাল্টা, মিষ্টি আঙুর! তাজা ফল, কেজি দুইশো! এক দাম দুইশো!",
        "tts_text": "আপেল, মাল্টা, মিষ্টি আঙুর! <short pause> তাজা ফল, কেজি দুইশো! এক দাম দুইশো!",
        "en": "Apples, malta oranges, sweet grapes! Fresh fruit, two hundred a kilo! One price two hundred!",
        "style": (
            "AUDIO PROFILE: Fruit seller, mid-30s. "
            "THE SCENE: Tiered fruit stall on footpath. "
            "DIRECTOR'S NOTES: Booming, rhythmic call, stretched vowels on 'aangur'."
        ),
    },
    {
        "id": "hawker_cloth_1",
        "voice": "V_CLOTH",
        "display_bn": "যেটা নিবেন দেড়শো! বাইছা লন, দেইখা লন! এক দাম দেড়শো টাকা!",
        "tts_text": "যেটা নিবেন দেড়শো! <short pause> বাইছা লন, দেইখা লন! এক দাম দেড়শো টাকা!",
        "en": "Any piece, one-fifty! Pick and choose, look and take! One price, one-fifty!",
        "style": (
            "AUDIO PROFILE: Clothes seller, 35. "
            "THE SCENE: Footpath spread of T-shirts and trousers. "
            "DIRECTOR'S NOTES: Aggressive, rhythmic street chanting with hand-clapping tempo."
        ),
    },
    {
        "id": "hawker_singara_1",
        "voice": "V_SINGARA",
        "display_bn": "গরম গরম সিঙ্গারা! গরম সমুচা! মচমচে সিঙ্গারা, একদম তাজা গরম!",
        "tts_text": "গরম গরম সিঙ্গারা! গরম সমুচা! <short pause> মচমচে সিঙ্গারা, একদম তাজা গরম!",
        "en": "Piping hot singara! Hot samosa! Crispy singara, fresh and steaming hot!",
        "style": (
            "AUDIO PROFILE: Singara fryer, 40. "
            "THE SCENE: Large cast-iron wok boiling with mustard oil on the sidewalk. "
            "DIRECTOR'S NOTES: Warm, enticing call shouted above the crackle of frying dough."
        ),
    },
    {
        "id": "hawker_akh_1",
        "voice": "V_AKH",
        "display_bn": "আখের রস! ঠান্ডা আখের রস! এক গ্লাস বিশ টাকা, একদম খাঁটি আখের রস!",
        "tts_text": "আখের রস! ঠান্ডা আখের রস! <short pause> এক গ্লাস বিশ টাকা, একদম খাঁটি আখের রস!",
        "en": "Sugarcane juice! Cold sugarcane juice! A glass for twenty, pure cane juice!",
        "style": (
            "AUDIO PROFILE: Juice vendor, 38. "
            "THE SCENE: Hand-cranked iron sugarcane roller with mint and lemon. "
            "DIRECTOR'S NOTES: Clear, inviting, refreshing cadence."
        ),
    },
    {
        "id": "hawker_peyara_1",
        "voice": "V_PEYARA",
        "display_bn": "পেয়ারা মাখা! কাসুন্দি দিয়া, মরিচ-লবণ দিয়া পেয়ারা মাখা! টক-ঝাল পেয়ারা!",
        "tts_text": "পেয়ারা মাখা! কাসুন্দি দিয়া, মরিচ-লবণ দিয়া পেয়ারা মাখা! টক-ঝাল পেয়ারা!",
        "en": "Spiced guava! With kashundi mustard, chilli and salt! Tangy spicy guava!",
        "style": (
            "AUDIO PROFILE: Guava vendor, 34. "
            "THE SCENE: Glass box cart with green guavas, red chilli powder, mustard sauce. "
            "DIRECTOR'S NOTES: Seductive, tantalizing street call, mouth-watering inflection."
        ),
    },
    {
        "id": "hawker_sim_1",
        "voice": "V_SIM",
        "display_bn": "নতুন ফোর-জি সিম! সাথে ফ্রি মিনিট আর ইন্টারনেট অফার! ফ্রি সিম নেন ভাই!",
        "tts_text": "নতুন ফোর-জি সিম! <short pause> সাথে ফ্রি মিনিট আর ইন্টারনেট অফার! ফ্রি সিম নেন ভাই!",
        "en": "New 4G SIM! With free minutes and internet offers! Get a free SIM, bhai!",
        "style": (
            "AUDIO PROFILE: Telecom promoter, 24. "
            "THE SCENE: Branded umbrella booth near the intersection. "
            "DIRECTOR'S NOTES: Rapid, slick, energetic commercial patter."
        ),
    },
    {
        "id": "police_side_1",
        "voice": "V_CONSTABLE",
        "display_bn": "এই রিকশা! ডাইনে কী করস? সাইডে চাপ, বাঁয়ে যা!",
        "tts_text": "এই রিকশা! ডাইনে কী করস? সাইডে চাপ, বাঁয়ে যা!",
        "en": "Hey rickshaw! What are you doing in the middle? Squeeze to the side, go left!",
        "style": (
            "AUDIO PROFILE: Traffic constable, 30. "
            "THE SCENE: Stepping off the curb tapping a baton. "
            "DIRECTOR'S NOTES: Harsh, impatient, sharp street scolding."
        ),
    },
    {
        "id": "helper_pechone_1",
        "voice": "V_HELPER",
        "display_bn": "পিছনে আগান ভাই, পিছনে যান! পিছনে পুরা খালি, একটু চাপেন!",
        "tts_text": "পিছনে আগান ভাই, পিছনে যান! পিছনে পুরা খালি, একটু চাপেন!",
        "en": "Move forward to the back bhai, go back! The back is completely empty, squeeze in!",
        "style": (
            "AUDIO PROFILE: Bus helper, 19. "
            "THE SCENE: Hanging onto the door handle pushing boarding passengers in. "
            "DIRECTOR'S NOTES: Loud, insistent crowd-steering shout."
        ),
    },
    {
        "id": "passer_jam_1",
        "voice": "V_OFFICE",
        "display_bn": "মতিঝিলের এই জ্যামে পইড়া আজকে আর সময়মতো অফিসে ঢোকা হইলো না!",
        "tts_text": "<sigh> মতিঝিলের এই জ্যামে পইড়া আজকে আর সময়মতো অফিসে ঢোকা হইলো না! <laugh>",
        "en": "Stuck in this Motijheel jam, no way I'm getting into office on time today!",
        "style": (
            "AUDIO PROFILE: Commuter stuck in car/CNG, 34. "
            "THE SCENE: Sitting in deadlocked traffic at the roundabout. "
            "DIRECTOR'S NOTES: Exasperated sigh turning into half-amused laughter, classic Dhaka patience."
        ),
    },
    {
        "id": "beggar_1",
        "voice": "V_PEON",
        "display_bn": "আল্লাহর ওয়াস্তে কিছু দিন ভাই, দুই দিন কিছু খাই নাই।",
        "tts_text": "<sigh> আল্লাহর ওয়াস্তে কিছু দিন ভাই, দুই দিন কিছু খাই নাই।",
        "en": "For God's sake, give a little, bhai. I have not eaten for two days.",
        "style": (
            "AUDIO PROFILE: Elderly man, 60, sitting on the pavement with a steel bowl. "
            "THE SCENE: Calling softly to a passer-by near the mosque. "
            "DIRECTOR'S NOTES: Soft, tired and dignified. Not pleading loudly."
        ),
    },
    {
        "id": "beggar_2",
        "voice": "V_AUNTY",
        "display_bn": "মা, একটু সাহায্য করেন, আল্লাহ আপনার ভালো করবে।",
        "tts_text": "মা, একটু সাহায্য করেন, আল্লাহ আপনার ভালো করবে।",
        "en": "Mother, please help a little, God will reward you.",
        "style": (
            "AUDIO PROFILE: Older woman, 55, seated at the foot of an overbridge. "
            "THE SCENE: Asking quietly as people pass. "
            "DIRECTOR'S NOTES: Gentle and quiet, with warmth."
        ),
    },
    {
        "id": "hotel_welcome_1",
        "voice": "V_WATER",
        "display_bn": "আসেন ভাই, বসেন! গরম ভাত, কাচ্চি, কালা ভুনা আছে! কী খাবেন?",
        "tts_text": "আসেন ভাই, বসেন! গরম ভাত, কাচ্চি, কালা ভুনা আছে! কী খাবেন?",
        "en": "Come in, bhai, sit down! Hot rice, kacchi, kala bhuna! What will you have?",
        "style": (
            "AUDIO PROFILE: Hotel boy, 15. "
            "THE SCENE: Inside Mayer Doa Hotel, plates clattering, steam rising from the pots. "
            "DIRECTOR'S NOTES: Cheerful, quick and friendly, calling over the clatter."
        ),
    },
    {
        "id": "bump_1",
        "voice": "V_OFFICE",
        "display_bn": "আরে ভাই, দেখে হাঁটেন! ধাক্কা দিলেন তো!",
        "tts_text": "<gasp> আরে ভাই, দেখে হাঁটেন! ধাক্কা দিলেন তো!",
        "en": "Hey bhai, watch where you walk! You bumped right into me!",
        "style": (
            "AUDIO PROFILE: Office worker, 34. "
            "THE SCENE: Walking along the crowded footpath when a stranger barges into him. "
            "DIRECTOR'S NOTES: Startled, mildly annoyed, not angry."
        ),
    },
    {
        "id": "bump_2",
        "voice": "V_AUNTY",
        "display_bn": "উফ! সামনে দেখে চলেন না ভাই, এত তাড়া কীসের!",
        "tts_text": "<gasp> উফ! সামনে দেখে চলেন না ভাই, এত তাড়া কীসের!",
        "en": "Oof! Look ahead when you walk bhai, what's the big hurry!",
        "style": (
            "AUDIO PROFILE: Middle-aged woman, 45. "
            "THE SCENE: Shopping bag knocked as someone rushes past on the footpath. "
            "DIRECTOR'S NOTES: Sharp little gasp, then a scolding tone."
        ),
    },
    {
        "id": "player_pass_1",
        "voice": "V_FOOTBALL",
        "display_bn": "এই পাস দে! ডাইনে পাস দে! খালি আছে!",
        "tts_text": "এই পাস দে! ডাইনে পাস দে! খালি আছে!",
        "en": "Hey pass it! Pass to the right! Clear!",
        "style": (
            "AUDIO PROFILE: Teen football player, 16. "
            "THE SCENE: Evening kickabout on the grass inside the club ground. "
            "DIRECTOR'S NOTES: Breathless, urgent shouting across the pitch."
        ),
    },
    {
        "id": "player_goal_1",
        "voice": "V_FOOTBALL",
        "display_bn": "গোওওওওওল! সাবাশ মামা, কী গোল দিলো!",
        "tts_text": "গোওওওওওল! <laugh> সাবাশ মামা, কী গোল দিলো!",
        "en": "Goooaaal! Well done mama, what a goal!",
        "style": (
            "AUDIO PROFILE: Teen football player, 16. "
            "THE SCENE: Ball hitting the back of the net. "
            "DIRECTOR'S NOTES: Ecstatic, celebratory roar with triumphant laughter."
        ),
    },
    {
        "id": "hawker_attar_1",
        "voice": "V_ATTAR",
        "display_bn": "আতর! সুরমা! সুতি টুপি, জায়নামাজ! আসল খাঁটি আতর নেন ভাই!",
        "tts_text": "আতর! সুরমা! সুতি টুপি, জায়নামাজ! <short pause> আসল খাঁটি আতর নেন ভাই!",
        "en": "Attar! Surma kohl! Cotton caps, prayer mats! Get genuine pure attar, bhai!",
        "style": (
            "AUDIO PROFILE: Attar vendor, 45. "
            "THE SCENE: Sidewalk stall near the Motijheel mosque. "
            "DIRECTOR'S NOTES: Pious, gentle, respectful, welcoming street call."
        ),
    },
    {
        "id": "hotel_call_1",
        "voice": "V_HOTEL",
        "display_bn": "আসেন ভাই! গরম ভাত, কাচ্চি, গরুর কালা ভুনা, ঘন ডাল! ভিতরে সিট খালি, আসেন!",
        "tts_text": "আসেন ভাই! গরম ভাত, কাচ্চি, গরুর কালা ভুনা, ঘন ডাল! ভিতরে সিট খালি, আসেন!",
        "en": "Come in, bhai! Hot rice, kacchi, beef kala bhuna, thick dal! Seats free inside, come in!",
        "style": (
            "AUDIO PROFILE: Restaurant boy, 20. "
            "THE SCENE: Standing in the entrance of roadside Bengali eatery. "
            "DIRECTOR'S NOTES: Fast-paced, rhythmic restaurant hawking, reciting lunch dishes energetically."
        ),
    },
    {
        "id": "coolie_1",
        "voice": "V_COOLIE",
        "display_bn": "কুলি লাগবে স্যার? কুলি! বগি পর্যন্ত মাল পৌঁছায়া দিমু!",
        "tts_text": "কুলি লাগবে স্যার? কুলি! <short pause> বগি পর্যন্ত মাল পৌঁছায়া দিমু!",
        "en": "Need a porter, sir? Coolie! I'll carry your luggage right to your carriage!",
        "style": (
            "AUDIO PROFILE: Kamalapur railway coolie, 48. "
            "THE SCENE: Station approach road, bustling passenger crowd. "
            "DIRECTOR'S NOTES: Weathered, sturdy, breathless solicitation."
        ),
    },
    {
        "id": "snatch_victim_1",
        "voice": "V_SNATCH_VIC",
        "display_bn": "এই ছিনতাই! ছিনতাই! আমার মোবাইল নিয়া গেল! ধরেন ধরেন!",
        "tts_text": "<gasp> এই ছিনতাই! ছিনতাই! আমার মোবাইল নিয়া গেল! ধরেন ধরেন!",
        "en": "Snatcher! Snatcher! He took my phone! Catch him, catch him!",
        "style": (
            "AUDIO PROFILE: Male victim, late 20s. "
            "THE SCENE: Sidewalk robbery near the bank building. "
            "DIRECTOR'S NOTES: Sudden gasp of shock, frantic, high-pitched scream for public help."
        ),
    },
    {
        "id": "chase_1",
        "voice": "V_CHASER",
        "display_bn": "এই ধর! ধর ব্যাটারে! ওই যে গলির দিকে দৌড়ায়! ধর!",
        "tts_text": "এই ধর! ধর ব্যাটারে! ওই যে গলির দিকে দৌড়ায়! ধর!",
        "en": "Catch him! Grab that guy! There he runs toward the alley! Catch him!",
        "style": (
            "AUDIO PROFILE: Young athletic male passer-by, 26. "
            "THE SCENE: Sprinting across the road after the fleeing snatcher. "
            "DIRECTOR'S NOTES: Furious, breathless shouting at full sprint."
        ),
    },
    {
        "id": "chase_giveup_1",
        "voice": "V_GIVEUP",
        "display_bn": "গেল তো গেলই... ভিড়ের মধ্যে আর এইটা পাইবা না।",
        "tts_text": "<sigh> গেল তো গেলই... <short pause> ভিড়ের মধ্যে আর এইটা পাইবা না।",
        "en": "Gone is gone... in this crowd you'll never find him now.",
        "style": (
            "AUDIO PROFILE: Bystander catching breath, 48. "
            "THE SCENE: Stopping on the sidewalk as the thief disappears. "
            "DIRECTOR'S NOTES: Deep tired sigh, cynical, realistic Dhaka resignation."
        ),
    },
    {
        "id": "guardian_1",
        "voice": "V_GUARDIAN",
        "display_bn": "এই রাফি! এইদিকে আসো, রোদে যাইও না! টিফিন পুরাটা খাইছো?",
        "tts_text": "এই রাফি! এইদিকে আসো, রোদে যাইও না! <short pause> টিফিন পুরাটা খাইছো?",
        "en": "Hey Rafi! Come here, don't stand in the sun! Did you finish your whole tiffin?",
        "style": (
            "AUDIO PROFILE: Mother outside school gate, late 30s. "
            "THE SCENE: Crowded school dismissal gate under umbrella. "
            "DIRECTOR'S NOTES: Caring, slightly scolding, protective female motherly voice."
        ),
    },
    {
        "id": "pupil_1",
        "voice": "V_PUPIL",
        "display_bn": "আম্মু প্লিজ, একটা আইসক্রিম কিনে দাও না! অনেক গরম লাগতেছে!",
        "tts_text": "আম্মু প্লিজ, একটা আইসক্রিম কিনে দাও না! <short pause> অনেক গরম লাগতেছে!",
        "en": "Ammu please, buy me an ice cream! It's so hot!",
        "style": (
            "AUDIO PROFILE: 10-year-old school student in uniform. "
            "THE SCENE: Walking hand in hand with mother near ice cream cart. "
            "DIRECTOR'S NOTES: Whining, pleading, playful kid's voice."
        ),
    },
    {
        "id": "phone_1",
        "voice": "V_PHONE",
        "display_bn": "হ্যাঁ আম্মা, শুনতেছো? বেতন পাইছি আম্মা, বিকাশে টাকা পাঠায়া দিতাছি। শরীর ভালো তো তোমার?",
        "tts_text": "হ্যাঁ আম্মা, শুনতেছো? <short pause> বেতন পাইছি আম্মা, বিকাশে টাকা পাঠায়া দিতাছি। শরীর ভালো তো তোমার?",
        "en": "Yes Amma, can you hear me? I got my salary Amma, sending money by bKash. Are you feeling alright?",
        "style": (
            "AUDIO PROFILE: Young working woman, 24, calling mother in village. "
            "THE SCENE: Walking along the sidewalk near Motijheel after payday. "
            "DIRECTOR'S NOTES: Tender, affectionate, raising voice slightly over ambient street roar."
        ),
    },
]


def create_client(api_key=None):
    """Initializes the google-genai Client."""
    api_key = api_key or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not found in environment or arguments.")
        print("Set it using: export GEMINI_API_KEY='your_key'")
        sys.exit(1)

    try:
        from google import genai
        from google.genai import types
        return genai.Client(api_key=api_key, http_options=types.HttpOptions(timeout=90000))
    except ImportError:
        print("Error: google-genai package is not installed.")
        print("Install it with: pip install 'google-genai>=2.25.0'")
        sys.exit(1)


def save_audio_file(filepath, audio_bytes, rate=24000):
    """Saves raw or RIFF-wrapped audio bytes as standard 24kHz mono WAV."""
    filepath = Path(filepath)
    filepath.parent.mkdir(parents=True, exist_ok=True)

    if audio_bytes[:4] == b"RIFF":
        with open(filepath, "wb") as f:
            f.write(audio_bytes)
    else:
        with wave.open(str(filepath), "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(rate)
            wf.writeframes(audio_bytes)


def synthesize_line(client, line_def, voice_id, model_id="gemini-3.8-flash-tts", max_retries=3):
    """Synthesizes speech using Gemini 3.8 Flash TTS interactions API."""
    input_payload = [
        {
            "type": "text",
            "text": line_def["tts_text"],
            "annotations": [
                {
                    "type": "speech_metadata",
                    "style": line_def["style"],
                }
            ],
        }
    ]

    generation_config = {
        "speech_config": [
            {"voice": voice_id}
        ]
    }

    for attempt in range(1, max_retries + 1):
        try:
            interaction = client.interactions.create(
                model=model_id,
                input=input_payload,
                response_format={"type": "audio"},
                generation_config=generation_config,
            )
            data = interaction.output_audio.data
            return base64.b64decode(data)
        except Exception as e:
            err_msg = str(e)
            if attempt < max_retries and ("429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg or "timeout" in err_msg.lower()):
                wait = attempt * 3.0
                print(f"    [Rate limit / timeout on attempt {attempt}, waiting {wait:.1f}s...]")
                time.sleep(wait)
            else:
                raise e


def update_voices_js(output_dir, generated_files, embed_base64=False):
    """
    Generates voices/voices.js so index.html loads all generated clips.
    If embed_base64 is True, writes data:audio/wav;base64,... URIs
    allowing direct file:/// opening in browsers without CORS blocks.
    """
    output_dir = Path(output_dir)
    js_path = output_dir / "voices.js"

    # Register every clip on disk (earlier runs included), grouped by line id.
    ids = [l["id"] for l in LINES]
    on_disk = {}
    for p in sorted(output_dir.glob("*.wav")):
        stem = p.stem
        match = next((i for i in sorted(ids, key=len, reverse=True) if stem == i or stem.startswith(i + "-")), None)
        if match:
            on_disk.setdefault(match, []).append(str(p))
    generated_files = on_disk

    mapping = {}
    for line_id, files in generated_files.items():
        if not files:
            continue
        vals = []
        for f in files:
            p = Path(f)
            if embed_base64 and p.exists():
                with open(p, "rb") as audio_file:
                    b64 = base64.b64encode(audio_file.read()).decode("ascii")
                    vals.append(f"data:audio/wav;base64,{b64}")
            else:
                # Relative path from index.html: "voices/filename.wav"
                vals.append(f"voices/{p.name}")
        mapping[line_id] = vals if len(vals) > 1 else vals[0]

    with open(js_path, "w", encoding="utf-8") as f:
        f.write("// Generated by generate_voices.py for Shapla Chattar Live\n")
        f.write("window.SHAPLA_VOICES = ")
        json.dump(mapping, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    print(f"\nUpdated {js_path} with {len(mapping)} registered lines.")


def main():
    parser = argparse.ArgumentParser(
        description="Generate realistic street voices for Shapla Chattar Live using Gemini 3.8 Flash TTS."
    )
    parser.add_argument(
        "--api-key",
        help="Google Gemini API key (or set GEMINI_API_KEY environment variable).",
    )
    parser.add_argument(
        "--model",
        default="gemini-3.8-flash-tts",
        choices=["gemini-3.8-flash-tts", "gemini-3.8-flash-lite-tts"],
        help="Gemini TTS model (default: gemini-3.8-flash-tts).",
    )
    parser.add_argument(
        "--voice-mode",
        default="prebuilt",
        choices=["prebuilt", "custom"],
        help="Voice mode: 'prebuilt' (uses 30 studio voices) or 'custom' (creates designed voices via client.voices).",
    )
    parser.add_argument(
        "--output-dir",
        default=str(Path(__file__).parent / "voices"),
        help="Output directory for audio files (default: shapla-chattar/voices).",
    )
    parser.add_argument(
        "--line",
        help="Generate only a specific line ID (e.g. --line hawker_tea_1).",
    )
    parser.add_argument(
        "--takes",
        type=int,
        default=1,
        help="Number of takes to generate per line (e.g. 2 or 3 generates id.wav, id-b.wav).",
    )
    parser.add_argument(
        "--embed-base64",
        action="store_true",
        help="Embed audio as base64 in voices.js so the scene works directly on file:/// without CORS issues.",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=7.0,
        help="Seconds to wait between requests (default 7, suits free-tier per-minute limits).",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Regenerate clips even if the WAV file already exists.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print all scripts, speech metadata, and voice configurations without calling API.",
    )
    args = parser.parse_args()

    # Dry-run preview
    if args.dry_run:
        print("=" * 80)
        print("SHAPLA CHATTAR LIVE — GEMINI 3.8 FLASH TTS SCRIPT AUDIT & PREVIEW")
        print("=" * 80)
        print(f"Total lines: {len(LINES)}")
        print(f"Total voice character profiles: {len(VOICE_PROFILES)}")
        print(f"Target model: {args.model}")
        print(f"Voice mode: {args.voice_mode}\n")

        filter_id = args.line
        for i, l in enumerate(LINES, 1):
            if filter_id and l["id"] != filter_id:
                continue
            vp = VOICE_PROFILES[l["voice"]]
            print(f"[{i:02d}/56] ID: {l['id']}")
            print(f"     Speaker:  {vp['name']} (Voice Key: {l['voice']}, Prebuilt: {vp['prebuilt']})")
            print(f"     Display:  {l['display_bn']}")
            print(f"     TTS Text: {l['tts_text']}")
            print(f"     English:  {l['en']}")
            print(f"     Style:    {l['style'][:100]}...")
            print("-" * 80)
        return

    # Real synthesis run
    client = create_client(args.api_key)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Optional: create custom designed voices using client.voices
    voice_map = {}
    if args.voice_mode == "custom":
        print("Designing custom voice personas using client.voices.create...")
        for v_key, v_info in VOICE_PROFILES.items():
            try:
                cv = client.voices.create(
                    store=True,
                    voice={
                        "model": args.model,
                        "type": "prompted",
                        "display_name": v_info["name"],
                        "prompted": {"input": v_info["design_prompt"]},
                    },
                )
                voice_map[v_key] = cv.id
                print(f"  Created Voice for {v_info['name']}: ID={cv.id}")
            except Exception as e:
                print(f"  Warning: Failed to design voice for {v_key} ({e}). Falling back to prebuilt {v_info['prebuilt']}.")
                voice_map[v_key] = v_info["prebuilt"]
    else:
        for v_key, v_info in VOICE_PROFILES.items():
            voice_map[v_key] = v_info["prebuilt"]

    # Generate files
    take_suffixes = ["", "-b", "-c", "-d", "-e"]
    generated = {}
    quota_hit = False
    # Extra keys to rotate through when one hits its quota: GEMINI_API_KEYS="key1,key2,..."
    key_pool = [k.strip() for k in os.environ.get("GEMINI_API_KEYS", "").split(",") if k.strip()]
    selected_lines = [l for l in LINES if not args.line or l["id"] == args.line]

    print(f"\nStarting synthesis for {len(selected_lines)} lines ({args.takes} take(s) each)...")
    for idx, l in enumerate(selected_lines, 1):
        line_id = l["id"]
        v_key = l["voice"]
        voice_id = voice_map[v_key]
        generated[line_id] = []

        print(f"[{idx:02d}/{len(selected_lines)}] Synthesizing '{line_id}' ({VOICE_PROFILES[v_key]['name']})...")
        for take in range(args.takes):
            suffix = take_suffixes[take] if take < len(take_suffixes) else f"-{take+1}"
            out_file = output_dir / f"{line_id}{suffix}.wav"
            if out_file.exists() and not args.force:
                print(f"    Take {take+1}: already have {out_file.name}, skipping")
                continue
            if quota_hit:
                break

            try:
                t0 = time.time()
                audio_bytes = synthesize_line(client, l, voice_id, model_id=args.model)
                save_audio_file(out_file, audio_bytes)
                elapsed = time.time() - t0
                generated[line_id].append(str(out_file))
                print(f"    Take {take+1}: saved to {out_file.name} ({len(audio_bytes)/1024:.1f} KB, {elapsed:.2f}s)")
            except Exception as e:
                msg = str(e)
                print(f"    Take {take+1} FAILED: {msg[:200]}")
                if "429" in msg or "RESOURCE_EXHAUSTED" in msg or "timeout" in msg.lower() or "timed out" in msg.lower():
                    if key_pool:
                        print(f"    Quota reached on this key; switching to the next key ({len(key_pool)} left).")
                        client = create_client(key_pool.pop(0))
                        try:
                            audio_bytes = synthesize_line(client, l, voice_id, model_id=args.model)
                            save_audio_file(out_file, audio_bytes)
                            generated[line_id].append(str(out_file))
                            print(f"    Take {take+1}: saved to {out_file.name} on the next key")
                        except Exception as e2:
                            print(f"    Take {take+1} FAILED again: {str(e2)[:160]}")
                    else:
                        quota_hit = True
                        print("\n  Free-tier quota reached on every key. Saved clips are kept; run the same command again later to continue.")
                        break

            # Pause between requests to stay under free-tier per-minute limits
            time.sleep(args.delay)
        if quota_hit:
            break

    # Clean up custom voices if temporary
    if args.voice_mode == "custom":
        print("\nCleaning up stored custom voices...")
        for v_key, v_id in voice_map.items():
            if v_id != VOICE_PROFILES[v_key]["prebuilt"]:
                try:
                    client.voices.delete(id=v_id)
                except Exception:
                    pass

    # Update voices.js
    update_voices_js(output_dir, generated, embed_base64=args.embed_base64)
    print("\nSynthesis complete!")


if __name__ == "__main__":
    main()
