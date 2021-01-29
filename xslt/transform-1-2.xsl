<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.1" 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:ns1="ns1:test" 
  xmlns:ns2="ns2:test">

  <xsl:output indent="yes" encoding="UTF-8" omit-xml-declaration="yes"/>

  <xsl:template match="ns1:input">
    <xsl:element name="output">
      <xsl:apply-templates />
    </xsl:element>
  </xsl:template>

  <xsl:template match="ns1:element">
    <xsl:element name="element">
      <xsl:attribute name="id">
        <xsl:value-of select="@id"/>
      </xsl:attribute>
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="node()[starts-with(name(), 'ns2:field')]">
    <xsl:element name="{local-name()}">
      <xsl:attribute name="element_id">
        <xsl:value-of select="../@id"/>
      </xsl:attribute>
      <xsl:value-of select="."/>
    </xsl:element>
  </xsl:template>

</xsl:stylesheet> 
