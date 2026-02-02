package org.tribenet.tribenet.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ClubResponseDTO {
    private Long id;
    private String name;
    private String description;
    private String category;
    private boolean free;
    private BigDecimal price;
    private String clubRole;
    private Integer memberCount;
}
