use rand::RngExt;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PirinolaFace {
    Pon1,
    Pon2,
    Toma1,
    Toma2,
    TodosPonen,
    TomaTodo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FaceMetadata {
    pub id: String,
    pub index: u8,
    pub angle_deg: u16,
    pub label_es: String,
    pub label_en: String,
    pub short_es: String,
    pub short_en: String,
    pub dicho_es: String,
    pub dicho_en: String,
    pub icon: String,
    pub color: String,
    pub is_positive: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpinPhysics {
    pub power: f32,       // 0.15 ..= 1.0
    pub tier: String,     // "suave", "fuerte", "turbo"
    pub rotations: u8,    // 5 ..= 14 full 360 turns
    pub duration_ms: u32, // 1800 ..= 3200 ms
    pub wobble_deg: u8,   // 10 ..= 24 deg
}

impl PirinolaFace {
    pub const ALL: [PirinolaFace; 6] = [
        PirinolaFace::Pon1,
        PirinolaFace::Pon2,
        PirinolaFace::Toma1,
        PirinolaFace::Toma2,
        PirinolaFace::TodosPonen,
        PirinolaFace::TomaTodo,
    ];

    pub fn random() -> Self {
        let mut rng = rand::rng();
        let idx = rng.random_range(0..6);
        Self::ALL[idx]
    }

    pub fn from_index(idx: u8) -> Self {
        Self::ALL[(idx as usize) % 6]
    }

    pub fn index(self) -> u8 {
        match self {
            PirinolaFace::Pon1 => 0,
            PirinolaFace::Pon2 => 1,
            PirinolaFace::Toma1 => 2,
            PirinolaFace::Toma2 => 3,
            PirinolaFace::TodosPonen => 4,
            PirinolaFace::TomaTodo => 5,
        }
    }

    pub fn id_str(self) -> &'static str {
        match self {
            PirinolaFace::Pon1 => "pon_1",
            PirinolaFace::Pon2 => "pon_2",
            PirinolaFace::Toma1 => "toma_1",
            PirinolaFace::Toma2 => "toma_2",
            PirinolaFace::TodosPonen => "todos_ponen",
            PirinolaFace::TomaTodo => "toma_todo",
        }
    }

    pub fn metadata(self) -> FaceMetadata {
        match self {
            PirinolaFace::Pon1 => FaceMetadata {
                id: "pon_1".to_string(),
                index: 0,
                angle_deg: 0,
                label_es: "PON 1".to_string(),
                label_en: "PUT 1".to_string(),
                short_es: "Pon 1 ficha al pozo".to_string(),
                short_en: "Put 1 coin in the pot".to_string(),
                dicho_es: "¡Pon uno al pozo, que no te dé codo!".to_string(),
                dicho_en: "Drop one in the pot, don't be stingy!".to_string(),
                icon: "🪙".to_string(),
                color: "#e67e22".to_string(),
                is_positive: false,
            },
            PirinolaFace::Pon2 => FaceMetadata {
                id: "pon_2".to_string(),
                index: 1,
                angle_deg: 60,
                label_es: "PON 2".to_string(),
                label_en: "PUT 2".to_string(),
                short_es: "Pon 2 fichas al pozo".to_string(),
                short_en: "Put 2 coins in the pot".to_string(),
                dicho_es: "¡Pon dos pesitos, que engorde el cochinito!".to_string(),
                dicho_en: "Put two coins in, fatten up the piggy bank!".to_string(),
                icon: "💸".to_string(),
                color: "#d35400".to_string(),
                is_positive: false,
            },
            PirinolaFace::Toma1 => FaceMetadata {
                id: "toma_1".to_string(),
                index: 2,
                angle_deg: 120,
                label_es: "TOMA 1".to_string(),
                label_en: "TAKE 1".to_string(),
                short_es: "Toma 1 ficha del pozo".to_string(),
                short_en: "Take 1 coin from the pot".to_string(),
                dicho_es: "¡Toma uno solito, de poquito en poquito!".to_string(),
                dicho_en: "Take one coin home, little by little!".to_string(),
                icon: "✨".to_string(),
                color: "#27ae60".to_string(),
                is_positive: true,
            },
            PirinolaFace::Toma2 => FaceMetadata {
                id: "toma_2".to_string(),
                index: 3,
                angle_deg: 180,
                label_es: "TOMA 2".to_string(),
                label_en: "TAKE 2".to_string(),
                short_es: "Toma 2 fichas del pozo".to_string(),
                short_en: "Take 2 coins from the pot".to_string(),
                dicho_es: "¡Toma dos de jalón, qué buena bendición!".to_string(),
                dicho_en: "Take two at once, what a lucky blessing!".to_string(),
                icon: "💰".to_string(),
                color: "#16a085".to_string(),
                is_positive: true,
            },
            PirinolaFace::TodosPonen => FaceMetadata {
                id: "todos_ponen".to_string(),
                index: 4,
                angle_deg: 240,
                label_es: "TODOS PONEN".to_string(),
                label_en: "ALL PUT".to_string(),
                short_es: "Todos ponen 1 ficha al pozo".to_string(),
                short_en: "Everyone puts 1 coin in the pot".to_string(),
                dicho_es: "¡Todos ponen parejo, del más joven al más viejo!".to_string(),
                dicho_en: "Everyone puts in equally, from youngest to oldest!".to_string(),
                icon: "🙌".to_string(),
                color: "#8e44ad".to_string(),
                is_positive: false,
            },
            PirinolaFace::TomaTodo => FaceMetadata {
                id: "toma_todo".to_string(),
                index: 5,
                angle_deg: 300,
                label_es: "TOMA TODO".to_string(),
                label_en: "TAKE ALL".to_string(),
                short_es: "¡Te llevas todo el pozo!".to_string(),
                short_en: "You sweep the entire pot!".to_string(),
                dicho_es: "¡Toma todo el montón, qué suerte de campeón!".to_string(),
                dicho_en: "Take the whole pile, what champion luck!".to_string(),
                icon: "👑".to_string(),
                color: "#f1c40f".to_string(),
                is_positive: true,
            },
        }
    }

    pub fn all_metadata() -> Vec<FaceMetadata> {
        Self::ALL.iter().map(|f| f.metadata()).collect()
    }
}

pub fn compute_spin_physics(raw_power: Option<f32>) -> SpinPhysics {
    let clamped = raw_power.unwrap_or(0.65).clamp(0.15, 1.0);
    let (tier, rotations, duration_ms, wobble_deg) = if clamped < 0.42 {
        ("suave".to_string(), 6, 1900, 12)
    } else if clamped < 0.78 {
        ("fuerte".to_string(), 9, 2350, 16)
    } else {
        ("turbo".to_string(), 13, 2750, 22)
    };

    SpinPhysics {
        power: (clamped * 100.0).round() / 100.0,
        tier,
        rotations,
        duration_ms,
        wobble_deg,
    }
}

pub fn evaluate_combo(
    first: PirinolaFace,
    second: Option<PirinolaFace>,
) -> Option<(String, String)> {
    let second = second?;
    match (first, second) {
        (PirinolaFace::TomaTodo, PirinolaFace::TomaTodo) => Some((
            "👑 ¡DOBLE TOMA TODO! ¡Lotería de la Pirinola!".to_string(),
            "👑 DOUBLE TAKE ALL! Ultimate Pirinola Jackpot!".to_string(),
        )),
        (PirinolaFace::TodosPonen, PirinolaFace::TomaTodo)
        | (PirinolaFace::TomaTodo, PirinolaFace::TodosPonen) => Some((
            "🔥 ¡COMBO PERFECTO! ¡Todos ponen y te lo llevas TODO!".to_string(),
            "🔥 PERFECT COMBO! Everyone puts in and you TAKE ALL!".to_string(),
        )),
        (PirinolaFace::TodosPonen, PirinolaFace::TodosPonen) => Some((
            "🌊 ¡DOBLE COOPERACHA! ¡El pozo se puso gigante!".to_string(),
            "🌊 DOUBLE ANTE! The center pot just exploded!".to_string(),
        )),
        (PirinolaFace::Pon2, PirinolaFace::Pon2) => Some((
            "😱 ¡DOBLE CASTIGO! ¡Pon 4 fichas al pozo!".to_string(),
            "😱 DOUBLE PENALTY! Put 4x stake into the pot!".to_string(),
        )),
        (PirinolaFace::Toma2, PirinolaFace::Toma2) => Some((
            "💰 ¡MANO SANTA! ¡Toma 4 fichas del pozo!".to_string(),
            "💰 BLESSED HAND! Take 4x stake from the pot!".to_string(),
        )),
        (a, b) if a == b => {
            let meta = a.metadata();
            Some((
                format!("⚡ ¡PAR DE {}!", meta.label_es),
                format!("⚡ DOUBLE {}!", meta.label_en),
            ))
        }
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_all_faces_metadata_and_indices() {
        let all = PirinolaFace::all_metadata();
        assert_eq!(all.len(), 6);
        for (i, meta) in all.iter().enumerate() {
            assert_eq!(meta.index as usize, i);
            assert_eq!(meta.angle_deg, (i as u16) * 60);
            assert!(!meta.label_es.is_empty());
            assert!(!meta.label_en.is_empty());
            assert!(!meta.dicho_es.is_empty());
            assert!(!meta.dicho_en.is_empty());
            assert_eq!(PirinolaFace::from_index(i as u8).id_str(), meta.id);
        }
    }

    #[test]
    fn test_spin_physics_tiers() {
        let suave = compute_spin_physics(Some(0.2));
        assert_eq!(suave.tier, "suave");
        assert!(suave.rotations >= 5);

        let fuerte = compute_spin_physics(None);
        assert_eq!(fuerte.tier, "fuerte");

        let turbo = compute_spin_physics(Some(0.95));
        assert_eq!(turbo.tier, "turbo");
        assert!(turbo.rotations > fuerte.rotations);
    }

    #[test]
    fn test_combo_evaluation() {
        assert!(evaluate_combo(PirinolaFace::Pon1, None).is_none());
        let jackpot = evaluate_combo(PirinolaFace::TomaTodo, Some(PirinolaFace::TomaTodo));
        assert!(jackpot.is_some());
        let perfect = evaluate_combo(PirinolaFace::TodosPonen, Some(PirinolaFace::TomaTodo));
        assert!(perfect.is_some());
        let mixed = evaluate_combo(PirinolaFace::Pon1, Some(PirinolaFace::Toma1));
        assert!(mixed.is_none());
    }
}
