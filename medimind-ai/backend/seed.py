"""
Seed script — populates DB with realistic demo data for Indian pharmacy.
Run: python seed.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import date, timedelta
from database import SessionLocal, init_db
from models.user import User
from models.medicine import Medicine
from models.alert import Alert
from core.auth import hash_password

def seed():
    init_db()
    db = SessionLocal()

    # ── Admin user ────────────────────────────────────────────────────────────
    if not db.query(User).filter(User.email == "admin@medimind.ai").first():
        db.add(User(
            name="Dr. Admin",
            email="admin@medimind.ai",
            hashed_password=hash_password("Admin@123"),
            role="admin",
        ))
        db.add(User(
            name="Priya Sharma",
            email="pharmacist@medimind.ai",
            hashed_password=hash_password("Pharma@123"),
            role="pharmacist",
        ))
        db.commit()
        print("[OK] Users seeded")

    # ── Medicines ─────────────────────────────────────────────────────────────
    today = date.today()
    medicines_data = [
        # Analgesics
        ("Paracetamol 500mg", "Paracetamol", "Analgesic", "Sun Pharma", "PCM-500-001", 450, 100, 1000, 2.5, 5.0, date(2026, 12, 31), 0),
        ("Ibuprofen 400mg", "Ibuprofen", "Analgesic", "Cipla", "IBU-400-001", 30, 80, 600, 4.0, 8.0, date(2026, 8, 15), 0),
        ("Aspirin 75mg", "Aspirin", "Analgesic", "Bayer", "ASP-75-001", 200, 50, 400, 1.5, 3.0, date(2027, 3, 31), 0),
        # Antibiotics
        ("Amoxicillin 500mg", "Amoxicillin", "Antibiotic", "Aurobindo", "AMX-500-001", 15, 60, 300, 8.0, 16.0, date(2025, 12, 31), 0),
        ("Azithromycin 500mg", "Azithromycin", "Antibiotic", "Pfizer", "AZI-500-001", 80, 40, 200, 25.0, 50.0, date(2026, 6, 30), 0),
        ("Ciprofloxacin 500mg", "Ciprofloxacin", "Antibiotic", "Cipla", "CIP-500-001", 5, 50, 300, 6.0, 12.0, today + timedelta(days=15), 0),
        # Cardiovascular
        ("Atenolol 50mg", "Atenolol", "Cardiovascular", "Zydus", "ATN-50-001", 350, 100, 500, 3.0, 6.0, date(2027, 1, 31), 0),
        ("Amlodipine 5mg", "Amlodipine", "Cardiovascular", "Sun Pharma", "AML-5-001", 0, 80, 400, 2.5, 5.0, date(2026, 11, 30), 0),
        ("Metformin 500mg", "Metformin", "Antidiabetic", "USV", "MET-500-001", 600, 120, 800, 1.8, 4.0, date(2027, 6, 30), 0),
        # Antacids
        ("Omeprazole 20mg", "Omeprazole", "Antacid", "Torrent", "OMP-20-001", 25, 60, 400, 5.0, 10.0, date(2026, 9, 30), 0),
        ("Pantoprazole 40mg", "Pantoprazole", "Antacid", "Alkem", "PAN-40-001", 180, 80, 500, 6.5, 13.0, date(2027, 2, 28), 0),
        # Vitamins
        ("Vitamin D3 60K", "Cholecalciferol", "Vitamin", "Meyer Organics", "VTD-60K-001", 90, 50, 300, 45.0, 90.0, date(2027, 5, 31), 0),
        ("Vitamin B12 1500mcg", "Cyanocobalamin", "Vitamin", "Abbott", "VTB-1500-001", 12, 40, 200, 35.0, 70.0, today + timedelta(days=45), 0),
        # ORS & Rehydration
        ("ORS Electrolyte Powder", "ORS", "Rehydration", "Abbott", "ORS-001", 50, 100, 1000, 5.0, 10.0, date(2026, 7, 31), 0),
        ("Dextrose IV 500ml", "Dextrose", "IV Fluid", "Baxter", "DEX-500-001", 8, 20, 100, 80.0, 120.0, date(2026, 10, 31), 0),
        # Controlled
        ("Tramadol 50mg", "Tramadol", "Analgesic-Opioid", "Neon Labs", "TRM-50-001", 30, 10, 50, 15.0, 28.0, date(2026, 12, 31), 1),
        ("Alprazolam 0.5mg", "Alprazolam", "Anxiolytic", "Torrent", "ALP-05-001", 20, 10, 50, 12.0, 22.0, date(2026, 11, 30), 1),
        # Cough & Cold
        ("Cetirizine 10mg", "Cetirizine", "Antihistamine", "UCB", "CET-10-001", 300, 100, 600, 2.0, 4.0, date(2027, 4, 30), 0),
        ("Dextromethorphan Syrup", "DXM", "Cough Suppressant", "Dabur", "DXM-SYR-001", 45, 30, 200, 55.0, 95.0, today + timedelta(days=20), 0),
        ("Montelukast 10mg", "Montelukast", "Anti-Asthmatic", "Sun Pharma", "MON-10-001", 110, 60, 350, 18.0, 35.0, date(2027, 1, 31), 0),
    ]

    existing_skus = {m.sku for m in db.query(Medicine.sku).all()}
    added = 0
    for row in medicines_data:
        name, generic, cat, mfr, sku, qty, reorder, max_s, cost, sell, exp, ctrl = row
        if sku in existing_skus:
            continue
        db.add(Medicine(
            name=name, generic_name=generic, category=cat, manufacturer=mfr,
            sku=sku, quantity=qty, reorder_level=reorder, max_stock=max_s,
            cost_price=cost, selling_price=sell, expiry_date=exp,
            is_controlled=ctrl, unit="strips", supplier=mfr,
            batch_number=f"BT{sku[:4]}2025",
        ))
        added += 1

    db.commit()
    print(f"[OK] {added} medicines seeded")

    # ── Auto alerts ───────────────────────────────────────────────────────────
    meds = db.query(Medicine).all()
    alert_count = 0
    for m in meds:
        if m.quantity <= m.reorder_level:
            if not db.query(Alert).filter(Alert.medicine_id == m.id, Alert.alert_type == "low_stock").first():
                db.add(Alert(
                    medicine_id=m.id, alert_type="low_stock",
                    severity="critical" if m.quantity == 0 else "warning",
                    title=f"Low Stock: {m.name}",
                    message=f"{m.name} has {m.quantity} {m.unit} left (reorder at {m.reorder_level}).",
                ))
                alert_count += 1
        if m.expiry_date:
            days_left = (m.expiry_date - today).days
            if 0 <= days_left <= 60:
                if not db.query(Alert).filter(Alert.medicine_id == m.id, Alert.alert_type == "expiry").first():
                    db.add(Alert(
                        medicine_id=m.id, alert_type="expiry",
                        severity="critical" if days_left <= 30 else "warning",
                        title=f"Expiry Alert: {m.name}",
                        message=f"{m.name} expires on {m.expiry_date} ({days_left} days). Qty: {m.quantity}.",
                    ))
                    alert_count += 1

    db.commit()
    db.close()
    print(f"[OK] {alert_count} alerts seeded")
    print("\n[SUCCESS] Seed complete!")
    print("   Admin:       admin@medimind.ai / Admin@123")
    print("   Pharmacist:  pharmacist@medimind.ai / Pharma@123")

if __name__ == "__main__":
    seed()
