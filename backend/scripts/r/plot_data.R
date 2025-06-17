#!/usr/bin/env Rscript
library(ggplot2)

args <- commandArgs(trailingOnly = TRUE)
n <- if (length(args) > 0) as.numeric(args[1]) else 0

if (is.na(n)) {
  write("Invalid numeric input for points.", stderr())
  quit(status=1)
}
if (n <= 0) {
  write("Please provide a positive number of points.", stderr())
  quit(status=1)
}

data <- data.frame(x = 1:n, y = cumsum(rnorm(n)))
write(sprintf("Generated data with %d points (first 5 shown):", n), stdout())
print(head(data, 5))

p <- ggplot(data, aes(x = x, y = y)) +
  geom_line(color="steelblue") +
  ggtitle(sprintf("Random Walk with %d points", n)) +
  theme_minimal()

output_path <- file.path(dirname(sys.frame(1)$ofile), "..", "output", "plot_output.png")

ggsave(filename=output_path, plot=p, width=6, height=4)
write(paste("Plot saved to", output_path), stdout())
write("Plot generation completed.", stdout())
