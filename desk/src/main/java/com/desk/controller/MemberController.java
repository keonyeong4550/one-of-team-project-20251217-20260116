package com.desk.controller;

import com.desk.dto.MemberJoinDTO;
import com.desk.service.FaceService;
import com.desk.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/api/member")
public class MemberController {

    private final MemberService memberService;
    private final FaceService faceService;

    @PostMapping("/join")
    public Map<String, String> join(@RequestBody MemberJoinDTO memberJoinDTO) {
        log.info("member join: " + memberJoinDTO);

        memberService.join(memberJoinDTO);

        return Map.of("result", "success");
    }

    @PostMapping("/face-register")
    public Map<String, String> faceRegister(@RequestParam String email, @RequestParam MultipartFile faceFile) throws IOException {
        faceService.registerFace(email, faceFile);
        return Map.of("result", "success");
    }

    @PutMapping("/update-face-status")
    public Map<String, String> updateFaceStatus(@RequestBody Map<String, Object> params) {
        faceService.updateFaceStatus((String) params.get("email"), (Boolean) params.get("status"));
        return Map.of("result", "success");
    }
}