import unittest

from rhythm_utils import infer_meter_from_downbeats, robust_bpm


class RhythmHelpersTest(unittest.TestCase):
    def test_robust_bpm_uses_sixty_seconds_per_minute(self):
        self.assertEqual(robust_bpm([0.0, 0.5, 1.0, 1.5, 2.0]), 120.0)

    def test_robust_bpm_normalizes_half_time(self):
        self.assertEqual(robust_bpm([0.0, 1.0, 2.0, 3.0]), 60.0)

    def test_meter_comes_from_downbeat_distance(self):
        rows = [(i * 0.5, (i % 4) + 1) for i in range(12)]
        self.assertEqual(infer_meter_from_downbeats(rows), 4)


if __name__ == "__main__":
    unittest.main()
