package org.tribenet.tribenet.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MemberResponseDTO {
    private Long userId;
    private String name;
    private String username;
    private String email;
    private String clubRole;
    private LocalDateTime joinedAt;
}
