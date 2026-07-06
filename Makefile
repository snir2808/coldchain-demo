CC ?= cc
CFLAGS ?= -Wall -Wextra -std=c11

.PHONY: parser clean

parser: firmware/test_parser

firmware/test_parser: firmware/parser.c firmware/test_parser.c firmware/parser.h
	$(CC) $(CFLAGS) -o $@ firmware/parser.c firmware/test_parser.c

clean:
	rm -f firmware/test_parser firmware/*.o
