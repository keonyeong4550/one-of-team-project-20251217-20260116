package com.desk.controller;

import com.desk.dto.MemberDTO;
import com.desk.dto.MemberJoinDTO;
import com.desk.dto.PageRequestDTO;
import com.desk.dto.PageResponseDTO;
import com.desk.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/api/member")
public class MemberController {

    private final MemberService memberService;

    @PostMapping("/join")
    public Map<String, String> join(@RequestBody MemberJoinDTO memberJoinDTO) {
        log.info("member join: " + memberJoinDTO);

        memberService.join(memberJoinDTO);

        return Map.of("result", "success");
    }

    // 일반 사용자용 멤버 검색 API (승인된 멤버만 검색)
    @GetMapping("/search")
    public PageResponseDTO<MemberDTO> searchMembers(
            PageRequestDTO pageRequestDTO,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "department", required = false) String department) {
        log.info("member search - keyword: {}, department: {}", keyword, department);
        return memberService.searchActiveMembers(pageRequestDTO, keyword, department);
    }
}