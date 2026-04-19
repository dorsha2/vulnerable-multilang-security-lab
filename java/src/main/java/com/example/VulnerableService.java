package com.example;

import java.io.StringReader;
import java.security.MessageDigest;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;
import org.xml.sax.InputSource;

public class VulnerableService {

    public String findUserByName(Connection conn, String username) throws Exception {
        Statement stmt = conn.createStatement();
        // SQL injection vulnerability (intentional)
        String sql = "SELECT * FROM users WHERE username = '" + username + "'";
        ResultSet rs = stmt.executeQuery(sql);
        return rs.next() ? rs.getString("username") : null;
    }

    public String hashPassword(String password) throws Exception {
        // Weak crypto vulnerability (intentional)
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] digest = md.digest(password.getBytes());
        StringBuilder sb = new StringBuilder();
        for (byte b : digest) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    public String runSystemCommand(String userInput) throws Exception {
        // Command injection vulnerability (intentional)
        Process p = Runtime.getRuntime().exec("sh -c " + userInput);
        return "pid=" + p.pid();
    }

    public String parseXml(String xml) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        // XXE vulnerability (intentional): external entities are not disabled
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(new InputSource(new StringReader(xml)));
        return doc.getDocumentElement().getNodeName();
    }
}
