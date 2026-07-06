#include <stdio.h>
#include <string.h>
#include "parser.h"

static int failures = 0;

#define CHECK(cond, msg) do { \
    if (!(cond)) { printf("FAIL: %s\n", msg); failures++; } \
    else { printf("ok:   %s\n", msg); } \
} while (0)

static void build_payload(uint8_t *buf, uint32_t device_id, uint8_t temp,
                          uint8_t flags, uint16_t battery_adc, uint32_t seq)
{
    memset(buf, 0, PAYLOAD_LEN);
    buf[0] = (uint8_t)(device_id >> 24);
    buf[1] = (uint8_t)(device_id >> 16);
    buf[2] = (uint8_t)(device_id >> 8);
    buf[3] = (uint8_t)device_id;
    buf[4] = temp;
    buf[5] = flags;
    buf[6] = (uint8_t)(battery_adc & 0xFF);
    buf[7] = (uint8_t)(battery_adc >> 8);
    buf[8] = (uint8_t)(seq & 0xFF);
    buf[9] = (uint8_t)((seq >> 8) & 0xFF);
    buf[10] = (uint8_t)((seq >> 16) & 0xFF);
    buf[11] = (uint8_t)((seq >> 24) & 0xFF);
    buf[PAYLOAD_LEN - 1] = crc8(buf, PAYLOAD_LEN - 1);
}

int main(void)
{
    uint8_t buf[PAYLOAD_LEN];
    reading_t r;

    build_payload(buf, 0xB211095CU, 4, FLAG_BATTERY_OK, 800, 7);
    CHECK(parse_reading(buf, PAYLOAD_LEN, &r) == 0, "chilled cargo parses");
    CHECK(r.device_id == 0xB211095CU, "device id decoded");
    CHECK(r.temp_c == 4, "chilled temp decoded");
    CHECK(r.flags == FLAG_BATTERY_OK, "flags decoded");
    CHECK(r.battery_adc == 800, "battery adc decoded");
    CHECK(r.seq == 7, "sequence decoded");

    build_payload(buf, 0xA107C344U, 25, FLAG_MOTION | FLAG_BATTERY_OK, 908, 100);
    CHECK(parse_reading(buf, PAYLOAD_LEN, &r) == 0, "ambient cargo parses");
    CHECK(r.temp_c == 25, "ambient temp decoded");

    build_payload(buf, 0xA107C344U, 25, FLAG_BATTERY_OK, 908, 100);
    buf[PAYLOAD_LEN - 1] ^= 0xFF;
    CHECK(parse_reading(buf, PAYLOAD_LEN, &r) == -2, "bad crc rejected");

    CHECK(parse_reading(buf, 10, &r) == -1, "short payload rejected");

    if (failures) {
        printf("%d test(s) failed\n", failures);
        return 1;
    }
    printf("all tests passed\n");
    return 0;
}
