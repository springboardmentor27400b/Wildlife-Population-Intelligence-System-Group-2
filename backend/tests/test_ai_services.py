import unittest

from app.services.ai_service import calculate_diversity_index, summarise_species_counts


class AIServicesTests(unittest.TestCase):
    def test_diversity_index_and_summary(self):
        counts = {"African Elephant": 4, "Masai Giraffe": 1, "African Fish Eagle": 1}
        summary = summarise_species_counts(counts)
        self.assertEqual(summary["total_species"], 3)
        self.assertAlmostEqual(summary["richness"], 3.0)
        self.assertGreater(summary["diversity_index"], 0)
        self.assertEqual(summary["most_common_species"], "African Elephant")
        self.assertEqual(summary["rare_species"], ["Masai Giraffe", "African Fish Eagle"])
        self.assertAlmostEqual(calculate_diversity_index(counts), 0.79, places=2)


if __name__ == "__main__":
    unittest.main()
