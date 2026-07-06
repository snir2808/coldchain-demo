#ifndef COLDCHAIN_PARSER_H
#define COLDCHAIN_PARSER_H

#include <stddef.h>
#include <stdint.h>

#define PAYLOAD_LEN 24

#define FLAG_MOTION      0x01
#define FLAG_DOOR_OPEN   0x02
#define FLAG_TAMPER      0x04
#define FLAG_EXT_POWER   0x08
#define FLAG_BATTERY_OK  0x10

typedef struct {
    uint32_t device_id;
    int16_t  temp_c;
    uint8_t  flags;
    uint16_t battery_adc;
    uint32_t seq;
} reading_t;

/* Returns 0 on success, -1 on bad length, -2 on bad CRC. */
int parse_reading(const uint8_t *buf, size_t len, reading_t *out);

uint8_t crc8(const uint8_t *data, size_t len);

#endif
