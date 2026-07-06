#include "parser.h"

uint8_t crc8(const uint8_t *data, size_t len)
{
    uint8_t crc = 0x00;
    for (size_t i = 0; i < len; i++) {
        crc ^= data[i];
        for (int b = 0; b < 8; b++) {
            crc = (crc & 0x80) ? (uint8_t)((crc << 1) ^ 0x07)
                               : (uint8_t)(crc << 1);
        }
    }
    return crc;
}

int parse_reading(const uint8_t *buf, size_t len, reading_t *out)
{
    if (len != PAYLOAD_LEN)
        return -1;

    if (crc8(buf, PAYLOAD_LEN - 1) != buf[PAYLOAD_LEN - 1])
        return -2;

    out->device_id = ((uint32_t)buf[0] << 24) |
                     ((uint32_t)buf[1] << 16) |
                     ((uint32_t)buf[2] << 8)  |
                     (uint32_t)buf[3];

    uint8_t temp = buf[4];
    out->temp_c = temp;

    out->flags = buf[5];

    out->battery_adc = (uint16_t)(buf[6] | ((uint16_t)buf[7] << 8));

    out->seq = (uint32_t)buf[8] |
               ((uint32_t)buf[9] << 8)  |
               ((uint32_t)buf[10] << 16) |
               ((uint32_t)buf[11] << 24);

    return 0;
}
