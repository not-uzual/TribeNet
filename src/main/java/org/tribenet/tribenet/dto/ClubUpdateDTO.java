package org.tribenet.tribenet.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ClubUpdateDTO {
    private String name;
    private String description;
    private String category;
    private Boolean free;
    private BigDecimal price;
}
