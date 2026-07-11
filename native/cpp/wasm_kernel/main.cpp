#include <algorithm>
#include <cmath>
#include <cstdint>
#include <iostream>
#include <numeric>
#include <span>
#include <stdexcept>
#include <string>
#include <vector>

namespace capsula {

struct SignalSummary {
  double mean;
  double variance;
  double rms;
  double peak;
  std::uint64_t samples;
};

SignalSummary summarize(std::span<const double> values) {
  if (values.empty()) {
    throw std::invalid_argument("cannot summarize an empty signal");
  }

  const double sum = std::accumulate(values.begin(), values.end(), 0.0);
  const double mean = sum / static_cast<double>(values.size());

  double sq_error = 0.0;
  double sq_sum = 0.0;
  double peak = 0.0;

  for (double value : values) {
    const double centered = value - mean;
    sq_error += centered * centered;
    sq_sum += value * value;
    peak = std::max(peak, std::abs(value));
  }

  return SignalSummary{
      mean,
      sq_error / static_cast<double>(values.size()),
      std::sqrt(sq_sum / static_cast<double>(values.size())),
      peak,
      static_cast<std::uint64_t>(values.size()),
  };
}

std::vector<double> generate_reference_signal(std::size_t count) {
  std::vector<double> values;
  values.reserve(count);
  for (std::size_t i = 0; i < count; ++i) {
    const double t = static_cast<double>(i) / 32.0;
    values.push_back(std::sin(t) + 0.25 * std::cos(3.0 * t));
  }
  return values;
}

}  // namespace capsula

int main() {
  const auto signal = capsula::generate_reference_signal(256);
  const auto summary = capsula::summarize(signal);

  std::cout << "CAPSULA C++ kernel smoke test\n";
  std::cout << "samples=" << summary.samples << "\n";
  std::cout << "mean=" << summary.mean << "\n";
  std::cout << "variance=" << summary.variance << "\n";
  std::cout << "rms=" << summary.rms << "\n";
  std::cout << "peak=" << summary.peak << "\n";
  return 0;
}
